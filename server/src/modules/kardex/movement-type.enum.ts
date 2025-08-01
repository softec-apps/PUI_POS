export enum KardexMovementType {
  // 📦 ENTRADAS PRINCIPALES
  PURCHASE = 'purchase', // 🛒 Compra de mercancía desde proveedor (entrada principal al inventario)
  RETURN_IN = 'return_in', // 🔄 Devolución de cliente (mercancía que vuelve al inventario)
  TRANSFER_IN = 'transfer_in', // 🚚 Transferencia entrante desde otro almacén

  // 🏷️ SALIDAS PRINCIPALES
  SALE = 'sale', // 💰 Venta de mercancía a cliente (salida principal del inventario)
  RETURN_OUT = 'return_out', // 📦 Devolución a proveedor (mercancía que se retira del inventario)
  TRANSFER_OUT = 'transfer_out', // 🚚 Transferencia saliente hacia otro almacén

  // 🛠️ AJUSTES DE INVENTARIO
  ADJUSTMENT_IN = 'adjustment_in', // ➕ Ajuste manual positivo (se detecta más inventario del esperado)
  ADJUSTMENT_OUT = 'adjustment_out', // ➖ Ajuste manual negativo (falta inventario)

  // ⚠️ PÉRDIDAS NO OPERACIONALES
  DAMAGED = 'damaged', // 🧃 Mercancía dañada (pérdida no recuperable)
  EXPIRED = 'expired', // ⏳ Mercancía vencida (se descarta del inventario)
}
