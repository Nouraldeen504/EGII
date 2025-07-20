import React from 'react';

const PrivacyPolicy = () => {
  return (
    <div className="container py-5">
      <div className="row justify-content-center">
        <div className="col-lg-8">
          <h1 className="mb-4">Privacy Policy</h1>
          <p className="text-muted mb-4">Last Updated: {new Date().toLocaleDateString()}</p>

          <section className="mb-5">
            <h2 className="h4 mb-3">1. Introduction</h2>
            <p className="mb-3">
              Optech ("we," "us," or "our") respects your privacy and is committed to protecting 
              your personal data when you use our website or purchase our network infrastructure products.
            </p>
          </section>

          <section className="mb-5">
            <h2 className="h4 mb-3">2. Information We Collect</h2>
            <ul className="list-group mb-3">
              <li className="list-group-item">
                <strong>Personal Data:</strong> Name, email, address, payment information
              </li>
              <li className="list-group-item">
                <strong>Technical Data:</strong> IP address, browser type, cookies
              </li>
              <li className="list-group-item">
                <strong>Order Details:</strong> Purchase history, product preferences
              </li>
            </ul>
          </section>

          <section className="mb-5">
            <h2 className="h4 mb-3">3. How We Use Your Information</h2>
            <div className="card mb-3">
              <div className="card-body">
                <ul className="mb-0">
                  <li>Process orders and deliver products</li>
                  <li>Provide customer support</li>
                  <li>Improve our services</li>
                  <li>Send marketing communications (with consent)</li>
                </ul>
              </div>
            </div>
          </section>

          <section className="mb-5">
            <h2 className="h4 mb-3">4. Data Security</h2>
            <p>
              We implement security measures including SSL encryption and secure payment processing.
              However, no online transmission is 100% secure.
            </p>
          </section>

          <section className="mb-5">
            <h2 className="h4 mb-3">5. Contact Us</h2>
            <p>
              For privacy concerns: <a href="mailto:info@optech.ly" className="link-primary">
                info@optech.ly
              </a>
            </p>
          </section>
        </div>
      </div>
    </div>
  );
};

export default PrivacyPolicy;