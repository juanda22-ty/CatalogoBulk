const mongoose = require('mongoose');

const usuarioSchema = new mongoose.Schema(
  {
    email: {
      type: String,
      required: [true, 'El email es requerido'],
      unique: true,
      lowercase: true,
      trim: true,
      match: [
        /^\w+([.-]?\w+)*@\w+([.-]?\w+)*(\.\w{2,3})+$/,
        'Por favor ingrese un email válido'
      ]
    },
    password: {
      type: String,
      required: [true, 'La contraseña es requerida'],
      select: false
    },
    rol: {
      type: String,
      enum: {
        values: ['admin', 'user'],
        message: 'El rol debe ser admin o user'
      },
      default: 'user'
    }
  },
  {
    timestamps: true
  }
);

// Ocultar la contraseña al transformar a JSON (seguridad adicional)
usuarioSchema.set('toJSON', {
  transform: (doc, ret) => {
    delete ret.password;
    delete ret.__v;
    return ret;
  }
});

const Usuario = mongoose.model('Usuario', usuarioSchema);

module.exports = Usuario;