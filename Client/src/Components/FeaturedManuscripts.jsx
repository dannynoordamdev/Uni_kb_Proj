import React from 'react';

const FeaturedManuscripts = ({ manuscripts = [] }) => {
    return (
        <section className="featured-manuscripts">
            <h2>Featured Manuscripts</h2>
            <div className="manuscripts-list">
                {manuscripts.length === 0 ? (
                    <p>No featured manuscripts available.</p>
                ) : (
                    manuscripts.map((manuscript, idx) => (
                        <div className="manuscript-card" key={manuscript.id || idx}>
                            <h3>{manuscript.title}</h3>
                            <p>{manuscript.author}</p>
                            <p>{manuscript.summary}</p>
                        </div>
                    ))
                )}
            </div>
        </section>
    );
};

export default FeaturedManuscripts;