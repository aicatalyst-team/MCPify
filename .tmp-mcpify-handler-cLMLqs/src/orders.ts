
export async function getOrderById(orderId: string) {
  return { id: orderId, status: 'pending' };
}

export async function updateOrderStatus(orderId: string, status: string) {
  return { id: orderId, status };
}

export async function fulfillOrder(orderId: string, status: string) {
  await getOrderById(orderId);
  return updateOrderStatus(orderId, status);
}
