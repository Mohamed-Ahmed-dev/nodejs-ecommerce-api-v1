const express = require("express");

const {
  createCashOrder,
  filterOrderForLoggedUser,
  findAllOrders,
  findOrder,
  updateOrderStatus,
  updateOrderToPay,
  updateOrderToDelivered,
  checkoutSession,
} = require("../services/orderService");

const AuthService = require("../services/authService");

const router = express.Router();

router.use(AuthService.protect);

router.post(
  "/checkout-session/:cartId",
  AuthService.allowedTo("user"),
  checkoutSession
);

router.route("/:cartId").post(AuthService.allowedTo("user"), createCashOrder);

router
  .route("/")
  .get(
    AuthService.allowedTo("user", "admin", "manager"),
    filterOrderForLoggedUser,
    findAllOrders
  );

router.route("/:id").get(findOrder);

router.put(
  "/:orderId/status",
  AuthService.allowedTo("admin", "manager"),
  updateOrderStatus
);
router.put(
  "/:orderId/pay",
  AuthService.allowedTo("admin", "manager"),
  updateOrderToPay
);
router.put(
  "/:orderId/deliver",
  AuthService.allowedTo("admin", "manager"),
  updateOrderToDelivered
);

module.exports = router;
