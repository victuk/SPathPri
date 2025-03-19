type OrderStatus =
    // Pending
    'pending' |
    // order Placed Successfully
    'order-placed' |
    // Order Accepted
    'assigned' |
    // Shopper has reached store
    'shopper-at-store' |
    // Shopper has started shopping
    'shopper-started-shopping' |
    // Delivery has begun
    'delivery-begun' |
    // Delivery arrived
    'delivery-arrived' |
    // Delivery Confirmed
    'delivery-confirmed';

export default OrderStatus;