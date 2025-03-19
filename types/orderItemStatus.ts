type OrderItemStatus = "pending" | "purchased" | "refund-pending" | "refund-paid";


// Order item is pending purchase
'pending'

// Order item has been purchased by the shopper
'purchased'

// The order item cash is going to be refunded
'refund'

export default OrderItemStatus;