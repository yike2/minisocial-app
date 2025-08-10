import React, { useState } from 'react';
import { postsAPI } from '../services/api';
import './CreatePost.css';

interface CreatePostProps {
    onPostCreated: () => void;
}

const CreatePost: React.FC<CreatePostProps> = ({ onPostCreated }) => {
    const [content, setContent] = useState('');
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const maxLength = 500;
    const remainingChars = maxLength - content.length;

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        if (!content.trim()) {
            setError('Post content cannot be empty');
            return;
        }

        if (content.length > maxLength) {
            setError(`Post content cannot exceed ${maxLength} characters`);
            return;
        }

        setIsSubmitting(true);
        setError(null);

        try {
            await postsAPI.createPost({ content: content.trim() });
            setContent('');
            onPostCreated(); // Refresh the posts list
        } catch (error: any) {
            setError(error.message || 'Failed to create post');
        } finally {
            setIsSubmitting(false);
        }
    };

    const handleContentChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
        const newContent = e.target.value;
        if (newContent.length <= maxLength) {
            setContent(newContent);
            setError(null);
        }
    };

    return (
        <div className="create-post-container">
            <h3>What's on your mind?</h3>

            <form onSubmit={handleSubmit} className="create-post-form">
                <div className="textarea-container">
                    <textarea
                        value={content}
                        onChange={handleContentChange}
                        placeholder="Share your thoughts..."
                        className={`post-textarea ${error ? 'error' : ''}`}
                        disabled={isSubmitting}
                        rows={4}
                    />
                    <div className="character-counter">
                        <span className={remainingChars < 50 ? 'warning' : remainingChars < 0 ? 'error' : ''}>
                            {remainingChars} characters remaining
                        </span>
                    </div>
                </div>

                {error && (
                    <div className="error-message">
                        {error}
                    </div>
                )}

                <div className="form-actions">
                    <button
                        type="button"
                        onClick={() => {
                            setContent('');
                            setError(null);
                        }}
                        disabled={isSubmitting || !content.trim()}
                        className="clear-button"
                    >
                        Clear
                    </button>

                    <button
                        type="submit"
                        disabled={isSubmitting || !content.trim() || content.length > maxLength}
                        className="submit-button"
                    >
                        {isSubmitting ? 'Posting...' : 'Post'}
                    </button>
                </div>
            </form>
        </div>
    );
};

export default CreatePost;