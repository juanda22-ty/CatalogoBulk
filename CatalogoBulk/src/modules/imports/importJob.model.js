import { Schema, model } from 'mongoose';

const errorDetalleSchema = new Schema(
  {
    fila: {
      type: Number,
      required: true
    },
    sku: {
      type: String,
      default: null
    },
    motivo: {
      type: String,
      required: true
    }
  },
  { _id: false }
);

const importJobSchema = new Schema(
  {
    usuarioId: {
      type: Schema.Types.ObjectId,
      ref: 'Usuario',
      required: [true, 'El usuarioId es requerido']
    },
    proveedorId: {
      type: Schema.Types.ObjectId,
      ref: 'Proveedor',
      required: [true, 'El proveedorId es requerido']
    },
    archivoNombre: {
      type: String,
      required: [true, 'El nombre original del archivo es requerido']
    },
    archivoRuta: {
      type: String,
      required: [true, 'La ruta en disco del archivo es requerida']
    },
    estado: {
      type: String,
      enum: {
        values: ['pending', 'processing', 'completed', 'failed'],
        message: 'Estado no válido'
      },
      default: 'pending'
    },
    total: {
      type: Number,
      default: null
    },
    procesados: {
      type: Number,
      default: 0
    },
    exitosos: {
      type: Number,
      default: 0
    },
    fallidos: {
      type: Number,
      default: 0
    },
    errores: [errorDetalleSchema],
    bullJobId: {
      type: String,
      default: null
    },
    motivoFallo: {
      type: String,
      default: null
    },
    startedAt: {
      type: Date,
      default: null
    },
    finishedAt: {
      type: Date,
      default: null
    }
  },
  {
    timestamps: true,
    collection: 'import_jobs'
  }
);

const ImportJob = model('ImportJob', importJobSchema);

export default ImportJob;