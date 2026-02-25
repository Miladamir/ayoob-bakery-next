import mongoose, { Schema, Document, Model } from 'mongoose';
import bcrypt from 'bcryptjs';

// 1. Interface for the User Document
export interface IUser extends Document {
    name: string;
    email: string;
    password?: string;
    googleId?: string;
    role: 'user' | 'admin';
    cart: ICartItem[];
    wishlist: mongoose.Types.ObjectId[];
    comparePassword(candidatePassword: string): Promise<boolean>;
}

export interface ICartItem {
    productId: mongoose.Types.ObjectId;
    quantity: number;
    note?: string;
}

// 2. The Schema
const userSchema = new Schema<IUser>({
    name: { type: String, default: '' },
    email: { type: String, unique: true, required: true },
    password: { type: String },
    googleId: { type: String },
    role: { type: String, default: 'user', enum: ['user', 'admin'] },
    cart: [{
        productId: { type: Schema.Types.ObjectId, ref: 'Product' },
        quantity: Number,
        note: String
    }],
    wishlist: [{ type: Schema.Types.ObjectId, ref: 'Product' }]
});

// 3. Middleware (Hooks)
// Fix: Use Promise-based middleware (remove 'next' argument) to avoid TypeScript confusion
userSchema.pre('save', async function () {
    // Only hash the password if it has been modified (or is new)
    if (!this.isModified('password')) return;

    if (this.password) {
        this.password = await bcrypt.hash(this.password, 10);
    }
});

// 4. Methods
userSchema.methods.comparePassword = async function (password: string): Promise<boolean> {
    if (!this.password) return false;
    return bcrypt.compare(password, this.password);
};

// 5. Export
const User: Model<IUser> = mongoose.models.User || mongoose.model<IUser>('User', userSchema);

export default User;