import Customer from "../models/customer.model.js";
import ApiResponse from "../utils/ApiRespose.js";
import asyncHandler from "../utils/asyncHandler.js"

// Create Customer
export const createCustomer = asyncHandler(async (req, res) => {
  try {
    const { name, phone, email, notes } = req.body;

    const existingCustomer = await Customer.findOne({ phone });

    if (existingCustomer) {
      return res.status(400).json(new ApiResponse(400, "customer is already exixts"));
    }

    const customer = await Customer.create({
      name,
      phone,
      email,
      notes,
    });

    res.status(201).json(new ApiResponse(201, "customer registerd successfully", customer));
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
});

// Get All Customers
export const getAllCustomers = asyncHandler(async (req, res) => {
  try {
    const customers = await Customer.find().sort({ createdAt: -1 });

    res.status(200).json(new ApiResponse(200, "customer Fetched successfully", customers));
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
});

// Get Customer By ID
export const getCustomerById = async (req, res) => {
  try {
    const customer = await Customer.findById(req.params.id);

    if (!customer) {
      return res.status(404).json({
        success: false,
        message: "Customer not found",
      });
    }

    res.status(200).json({
      success: true,
      customer,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

// Update Customer
export const updateCustomer = async (req, res) => {
  try {
    const customer = await Customer.findById(req.params.id);

    if (!customer) {
      return res.status(404).json({
        success: false,
        message: "Customer not found",
      });
    }

    const updatedCustomer = await Customer.findByIdAndUpdate(
      req.params.id,
      req.body,
      {
        new: true,
        runValidators: true,
      }
    );

    res.status(200).json({
      success: true,
      message: "Customer updated successfully",
      customer: updatedCustomer,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

// Delete Customer
export const deleteCustomer = async (req, res) => {
  try {
    const customer = await Customer.findById(req.params.id);

    if (!customer) {
      return res.status(404).json({
        success: false,
        message: "Customer not found",
      });
    }

    await customer.deleteOne();

    res.status(200).json({
      success: true,
      message: "Customer deleted successfully",
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

// Search Customer by Name or Phone
export const searchCustomer = async (req, res) => {
  try {
    const { keyword } = req.query;

    const customers = await Customer.find({
      $or: [
        { name: { $regex: keyword, $options: "i" } },
        { phone: { $regex: keyword, $options: "i" } },
      ],
    });

    res.status(200).json({
      success: true,
      count: customers.length,
      customers,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};