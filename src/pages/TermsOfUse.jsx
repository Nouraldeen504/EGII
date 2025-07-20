import React from 'react';

const TermsOfUse = () => {
  return (
    <div className="container py-5">
      <div className="row justify-content-center">
        <div className="col-lg-8">
          <h1 className="mb-4">Terms of Use</h1>
          <p className="text-muted mb-4">Last Updated: {new Date().toLocaleDateString()}</p>

          <section className="mb-5">
            <h2 className="h4 mb-3">1. Acceptance of Terms</h2>
            <p>
              By accessing optech.ly, you agree to these Terms. Fiber optic products are sold under these terms.
            </p>
          </section>

          <section className="mb-5">
            <h2 className="h4 mb-3">2. Products & Orders</h2>
            <div className="card mb-3">
              <div className="card-body">
                <ul className="mb-0">
                  <li>All fiber optic products subject to availability</li>
                  <li>Prices may change without notice</li>
                  <li>We reserve right to cancel suspicious orders</li>
                </ul>
              </div>
            </div>
          </section>

          <section className="mb-5">
            <h2 className="h4 mb-3">3. Returns Policy</h2>
            <table className="table table-bordered">
              <thead>
                <tr>
                  <th>Item Type</th>
                  <th>Return Window</th>
                </tr>
              </thead>
              <tbody>
                <tr>
                  <td>Standard Products</td>
                  <td>30 days</td>
                </tr>
                <tr>
                  <td>Custom Fiber Optics</td>
                  <td>Non-returnable</td>
                </tr>
              </tbody>
            </table>
          </section>

          <section className="mb-5">
            <h2 className="h4 mb-3">4. Limitation of Liability</h2>
            <div className="alert alert-warning">
              We're not liable for network failures resulting from improper installation of our products.
            </div>
          </section>

          <section className="mb-5">
            <h2 className="h4 mb-3">5. Governing Law</h2>
            <p>
              These Terms are governed by the laws of Libya.
            </p>
          </section>

          <section>
            <h2 className="h4 mb-3">6. Contact</h2>
            <p>
              Questions? Email <a href="mailto:info@optech.ly" className="link-primary">
                info@optech.ly
              </a>
            </p>
          </section>
        </div>
      </div>
    </div>
  );
};

export default TermsOfUse;