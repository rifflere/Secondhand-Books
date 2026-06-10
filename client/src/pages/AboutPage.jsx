import React from 'react';
import { Link } from 'react-router-dom';

export default function AboutPage() {
  return (
    <div className="main-content">
      <div className="about-page">
        <h1 className="page-heading">About</h1>

        <div className="about-body">
          <p className="about-lead">
            Secondhand Books is a personal digital bookshelf for readers who love keeping
            track of the stories that matter to them.
          </p>

          <section className="about-section">
            <h2 className="about-section-title">What it does</h2>
            <p>
              Search over 20 million books via the Open Library, save the ones you've read
              or want to read, and see what other readers are adding to their shelves right
              now. Your shelf is yours — private to your account and always up to date.
            </p>
          </section>

          <section className="about-section">
            <h2 className="about-section-title">How it's built</h2>
            <p>
              React + Vite on the frontend, Node.js + Express on the backend, MySQL for
              storage, deployed on AWS Free Tier. Book data comes from the{' '}
              <a
                href="https://openlibrary.org"
                target="_blank"
                rel="noreferrer"
                className="about-link"
              >
                Open Library
              </a>
              , a free and open catalog maintained by the Internet Archive.
            </p>
          </section>

          <section className="about-section">
            <h2 className="about-section-title">Get in touch</h2>
            <p>
              Questions, feedback, or just want to talk about books? Reach out at{' '}
              <a href="mailto:rebeccaeriffle@gmail.com" className="about-link">
                rebeccaeriffle@gmail.com
              </a>
              .
            </p>
          </section>

          <div className="about-cta">
            <Link to="/login" className="btn-primary btn-primary--inline">
              Get started →
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
