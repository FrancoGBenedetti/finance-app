export const ENTITY_TYPES = ['income', 'debito', 'expense', 'credit', 'portfolio', 'savings']

export const ENTITY_CONFIG = {
  income: {
    label: 'Ingreso',
    description: 'Dinero disponible',
    icon: '💰',
    badgeClass:  'bg-emerald-900/60 text-emerald-300 border border-emerald-800',
    buttonClass: 'bg-emerald-950 border border-emerald-800 hover:border-emerald-500 hover:bg-emerald-900/40 transition-colors',
    fields: [
      { key: 'title',  label: 'Título', type: 'text',   placeholder: 'ej: Sueldo', required: true },
      { key: 'amount', label: 'Monto',  type: 'number', placeholder: '0', required: true, min: 0, step: 1 },
    ],
  },

  debito: {
    label: 'Débito',
    description: 'Cuenta corriente o tarjeta de débito',
    icon: '🏦',
    badgeClass:  'bg-cyan-900/60 text-cyan-300 border border-cyan-800',
    buttonClass: 'bg-cyan-950 border border-cyan-800 hover:border-cyan-500 hover:bg-cyan-900/40 transition-colors',
    fields: [
      { key: 'title',  label: 'Título',            type: 'text',   placeholder: 'ej: Cuenta corriente BCI', required: true },
      { key: 'amount', label: 'Saldo disponible',  type: 'number', placeholder: '0', required: true, min: 0, step: 1 },
    ],
  },

  expense: {
    label: 'Gasto',
    description: 'Categoría acumuladora',
    icon: '💸',
    badgeClass:  'bg-red-900/60 text-red-300 border border-red-800',
    buttonClass: 'bg-red-950 border border-red-800 hover:border-red-500 hover:bg-red-900/40 transition-colors',
    fields: [
      { key: 'title',  label: 'Título',       type: 'text',   placeholder: 'ej: Restaurantes', required: true },
      { key: 'budget', label: 'Presupuesto',  type: 'number', placeholder: '0', required: false, min: 0, step: 1,
        hint: 'Opcional. Define un límite máximo para esta categoría.' },
    ],
  },

  credit: {
    label: 'Crédito',
    description: 'Tarjeta o línea de crédito',
    icon: '💳',
    badgeClass:  'bg-orange-900/60 text-orange-300 border border-orange-800',
    buttonClass: 'bg-orange-950 border border-orange-800 hover:border-orange-500 hover:bg-orange-900/40 transition-colors',
    fields: [
      { key: 'title', label: 'Título',               type: 'text',   placeholder: 'ej: Tarjeta Visa', required: true },
      { key: 'limit', label: 'Límite de crédito',    type: 'number', placeholder: '0', required: true,  min: 1, step: 1 },
      { key: 'used',  label: 'Ya gastado (opcional)',type: 'number', placeholder: '0', required: false, min: 0, step: 1,
        hint: 'Ingresa la deuda previa existente en esta tarjeta.' },
    ],
  },

  portfolio: {
    label: 'Portafolio',
    description: 'Suma de entidades seleccionadas',
    icon: '📊',
    badgeClass:  'bg-purple-900/60 text-purple-300 border border-purple-800',
    buttonClass: 'bg-purple-950 border border-purple-800 hover:border-purple-500 hover:bg-purple-900/40 transition-colors',
    fields: [
      { key: 'title', label: 'Título', type: 'text', placeholder: 'ej: Ingresos fijos', required: true },
      { key: 'linkedEntities', label: 'Entidades a agrupar', type: 'entity-multiselect', defaultValue: [],
        hint: 'El total del portafolio es la suma del valor principal de cada entidad seleccionada.' },
    ],
  },

  savings: {
    label: 'Ahorro',
    description: 'Monto asignado manualmente',
    icon: '🐷',
    badgeClass:  'bg-blue-900/60 text-blue-300 border border-blue-800',
    buttonClass: 'bg-blue-950 border border-blue-800 hover:border-blue-500 hover:bg-blue-900/40 transition-colors',
    fields: [
      { key: 'title',  label: 'Título',        type: 'text',   placeholder: 'ej: Fondo de emergencia', required: true },
      { key: 'amount', label: 'Monto ahorrado', type: 'number', placeholder: '0', required: true, min: 0, step: 1,
        hint: 'Ingresa manualmente cuánto tienes ahorrado en esta categoría.' },
    ],
  },
}
