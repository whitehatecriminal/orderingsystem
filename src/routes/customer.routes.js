import express from "express";
import {createCustomer, getAllCustomers, getCustomerById,
    updateCustomer, deleteCustomer, searchCustomer
} from "../controllers/customer.controller.js"
import {verifyFirebaseToken} from "../Middleware/auth.middleware.js"
import {isAdmin} from "../Middleware/admin.middleware.js"

const router = express.Router();

router.post('/', verifyFirebaseToken, createCustomer)
router.get('/', verifyFirebaseToken, getAllCustomers)
router.get('/search', verifyFirebaseToken, searchCustomer)
router.get('/:id', verifyFirebaseToken, getCustomerById)
router.patch('/:id', verifyFirebaseToken, updateCustomer)
router.delete('/:id', isAdmin, verifyFirebaseToken, deleteCustomer)

export default router