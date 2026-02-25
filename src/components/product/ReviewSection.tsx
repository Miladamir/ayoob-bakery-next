"use client";

import { useState } from "react";
import { useSession } from "next-auth/react";

interface ReviewSectionProps {
    product: any;
}

export default function ReviewSection({ product }: ReviewSectionProps) {
    const { data: session } = useSession();
    const [reviews, setReviews] = useState(product.reviews || []);

    // Form States
    const [form, setForm] = useState({ rating: 5, comment: "", reviewerName: "" });
    const [loading, setLoading] = useState(false);

    // Edit States
    const [isEditing, setIsEditing] = useState<string | null>(null);
    const [editForm, setEditForm] = useState({ rating: 5, comment: "" });

    // Helper to determine if current user is the author
    const isAuthor = (review: any) => {
        if (!session?.user) return false;
        // Assuming review.user is populated { _id, name } or just an ID string
        const reviewUserId = typeof review.user === 'object' ? review.user._id : review.user;
        return reviewUserId === session.user.id;
    };

    // Helper to get display name
    const getUserName = (user: any) => {
        if (!user) return 'Anonymous';
        return typeof user === 'object' ? user.name : user;
    };

    // --- Add Review ---
    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);

        try {
            const res = await fetch("/api/reviews", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    productId: product._id,
                    ...form,
                    reviewerName: session ? session.user?.name : form.reviewerName
                })
            });

            if (res.ok) {
                window.location.reload();
            } else {
                const data = await res.json();
                alert(data.message || "Failed to submit review");
            }
        } catch (err) {
            alert("Something went wrong");
        } finally {
            setLoading(false);
        }
    };

    // --- Edit Review ---
    const startEdit = (review: any) => {
        setIsEditing(review._id);
        setEditForm({ rating: review.rating, comment: review.comment });
    };

    const handleEditSubmit = async (reviewId: string) => {
        try {
            const res = await fetch("/api/reviews/manage", {
                method: "PUT",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    productId: product._id,
                    reviewId,
                    ...editForm
                })
            });

            if (res.ok) {
                setIsEditing(null);
                window.location.reload();
            } else {
                alert("Failed to update review");
            }
        } catch (err) {
            alert("Error updating review");
        }
    };

    // --- Delete Review ---
    const handleDelete = async (reviewId: string) => {
        if (!confirm("Are you sure you want to delete this review?")) return;

        try {
            const res = await fetch("/api/reviews/manage", {
                method: "DELETE",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ productId: product._id, reviewId })
            });

            if (res.ok) {
                window.location.reload();
            } else {
                alert("Failed to delete review");
            }
        } catch (err) {
            alert("Error deleting review");
        }
    };

    return (
        <div className="space-y-8">
            {/* Existing Reviews List */}
            <div className="space-y-6">
                {reviews.length > 0 ? (
                    reviews.map((review: any) => (
                        <div key={review._id || review.date} className="border-b border-gray-100 pb-6">
                            <div className="flex items-center gap-4 mb-2">
                                <div className="w-10 h-10 rounded-full bg-brand-100 flex items-center justify-center font-bold text-brand-600">
                                    {getUserName(review.user).charAt(0).toUpperCase()}
                                </div>
                                <div>
                                    <div className="font-bold text-gray-800">{getUserName(review.user)}</div>
                                    <div className="text-xs text-gray-400">{new Date(review.date).toLocaleDateString()}</div>
                                </div>
                                <div className="ml-auto flex text-yellow-400 text-sm">
                                    {[1, 2, 3, 4, 5].map((star) => (
                                        <i key={star} className={`${review.rating >= star ? 'fas' : 'far'} fa-star`}></i>
                                    ))}
                                </div>
                            </div>

                            {/* Edit Mode vs View Mode */}
                            {isEditing === review._id ? (
                                <div className="mt-4 space-y-3 bg-gray-50 p-4 rounded-lg">
                                    <select
                                        value={editForm.rating}
                                        onChange={(e) => setEditForm({ ...editForm, rating: parseInt(e.target.value) })}
                                        className="border p-2 rounded-lg bg-white"
                                    >
                                        {[5, 4, 3, 2, 1].map(r => <option key={r} value={r}>{r} Stars</option>)}
                                    </select>
                                    <textarea
                                        value={editForm.comment}
                                        onChange={(e) => setEditForm({ ...editForm, comment: e.target.value })}
                                        className="w-full border p-2 rounded-lg"
                                        rows={3}
                                    />
                                    <div className="flex gap-2">
                                        <button onClick={() => handleEditSubmit(review._id)} className="bg-brand-600 text-white px-4 py-2 rounded-lg text-sm font-bold">Save</button>
                                        <button onClick={() => setIsEditing(null)} className="bg-gray-200 text-gray-700 px-4 py-2 rounded-lg text-sm font-bold">Cancel</button>
                                    </div>
                                </div>
                            ) : (
                                <>
                                    <p className="text-gray-500 mt-2">{review.comment}</p>
                                    {/* Action Buttons */}
                                    {isAuthor(review) && (
                                        <div className="mt-3 flex gap-4 text-sm">
                                            <button onClick={() => startEdit(review)} className="text-brand-600 font-semibold hover:underline">Edit</button>
                                            <button onClick={() => handleDelete(review._id)} className="text-red-500 font-semibold hover:underline">Delete</button>
                                        </div>
                                    )}
                                </>
                            )}
                        </div>
                    ))
                ) : (
                    <p className="text-gray-500 text-center py-8">No reviews yet. Be the first!</p>
                )}
            </div>

            {/* Add Review Form */}
            <div className="mt-8 pt-8 border-t">
                <h4 className="font-serif text-xl font-bold text-gray-800 mb-4">Leave a Review</h4>
                <form onSubmit={handleSubmit} className="space-y-4">
                    <textarea
                        name="comment"
                        rows={3}
                        className="w-full border p-3 rounded-lg focus:ring-2 focus:ring-brand-500 outline-none"
                        placeholder="Share your thoughts..."
                        required
                        value={form.comment}
                        onChange={(e) => setForm({ ...form, comment: e.target.value })}
                    ></textarea>
                    <div className="flex flex-col sm:flex-row gap-4">
                        <select
                            name="rating"
                            className="border p-2 rounded-lg bg-white"
                            value={form.rating}
                            onChange={(e) => setForm({ ...form, rating: parseInt(e.target.value) })}
                        >
                            <option value="5">5 Stars - Excellent</option>
                            <option value="4">4 Stars - Good</option>
                            <option value="3">3 Stars - Average</option>
                            <option value="2">2 Stars - Poor</option>
                            <option value="1">1 Star - Terrible</option>
                        </select>
                        {/* If not logged in, ask for name */}
                        {!session && (
                            <input
                                type="text"
                                name="reviewerName"
                                placeholder="Your Name"
                                className="border p-2 rounded-lg flex-grow"
                                required
                                value={form.reviewerName}
                                onChange={(e) => setForm({ ...form, reviewerName: e.target.value })}
                            />
                        )}
                        <button
                            type="submit"
                            disabled={loading}
                            className="bg-brand-600 text-white px-6 py-2 rounded-lg font-bold hover:bg-brand-700 transition-colors disabled:opacity-50 whitespace-nowrap"
                        >
                            {loading ? "Submitting..." : "Submit Review"}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
}