export function calculatePayNowAmount(total, paymentMethod = 'deposit', depositAmount = 1) {
  const orderTotal = Math.max(Number(total) || 0, 0)

  if (paymentMethod === 'full') {
    return orderTotal
  }

  const deposit = Math.max(Number(depositAmount) || 0, 0)
  if (orderTotal === 0) return 0
  if (deposit <= 0) return orderTotal

  return Math.min(deposit, orderTotal)
}
