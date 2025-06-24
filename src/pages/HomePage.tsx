import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Scissors, Calendar, MapPin, Star, BarChart, Shield, Clock, BadgeCheck, Send } from 'lucide-react';
import Button from '../components/Button';
import toast from 'react-hot-toast';

interface ReviewAuthor {
  name: string;
  role: string;
  avatar: string;
  rating: number;
}

interface Review {
  id: number;
  content: string;
  author: ReviewAuthor;
}

const HomePage: React.FC = () => {
  const navigate = useNavigate();
  const [reviews, setReviews] = useState<Review[]>([]);
  const [showReviewForm, setShowReviewForm] = useState(false);
  const [newReview, setNewReview] = useState({
    content: '',
    rating: 5,
    name: '',
    role: 'customer'
  });

  const handleGetStarted = () => {
    navigate('/register', { state: { fromHome: true } });
  };

  const handleSubmitReview = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!newReview.content || !newReview.name) {
      toast.error('Please fill in all fields');
      return;
    }

    const review = {
      id: Date.now(),
      content: newReview.content,
      author: {
        name: newReview.name,
        role: newReview.role === 'barber' ? 'Owner, Professional Barber' : 'Customer',
        avatar: `https://i.pravatar.cc/150?u=${Date.now()}`,
        rating: newReview.rating
      }
    };

    setReviews([review, ...reviews]);
    setNewReview({ content: '', rating: 5, name: '', role: 'customer' });
    setShowReviewForm(false);
    toast.success('Review submitted successfully!');
  };

  return (
    <div className="flex flex-col">
      {/* Hero Section */}
      <section className="relative overflow-hidden bg-gradient-to-r from-primary to-primary-light py-20 text-white">
        <div className="container mx-auto px-4">
          <div className="grid items-center gap-8 md:grid-cols-2">
            <div className="animate-fade-in">
              <h1 className="mb-4 text-4xl font-bold leading-tight md:text-5xl lg:text-6xl">
                Revolutionize Your Barbershop Experience
              </h1>
              <p className="mb-6 text-lg md:text-xl">
                TRIMLY connects barbers with customers in Belagavi, simplifies scheduling, and enhances the overall experience with powerful tools and features.
              </p>
              <div className="flex flex-col space-y-4 sm:flex-row sm:space-x-4 sm:space-y-0">
                <Button
                  onClick={handleGetStarted}
                  className="bg-white px-6 py-3 font-semibold text-primary hover:bg-gray-100"
                >
                  Get Started
                </Button>
                <Link to="/login" className="btn border-2 border-white bg-transparent px-6 py-3 font-semibold text-white hover:bg-white/10">
                  Sign In
                </Link>
              </div>
            </div>
            <div className="flex justify-center md:justify-end">
              <div className="relative h-80 w-80 rounded-3xl bg-white/10 backdrop-blur-sm">
                <div className="absolute -left-4 -top-4 h-80 w-80 rounded-3xl bg-accent/20 backdrop-blur-sm"></div>
                <img
                  src="https://images.pexels.com/photos/1570806/pexels-photo-1570806.jpeg"
                  alt="Barber cutting client's hair"
                  className="absolute inset-4 rounded-2xl object-cover shadow-lg"
                />
              </div>
            </div>
          </div>
        </div>
        
        {/* Background Elements */}
        <div className="absolute -bottom-16 -left-16 h-64 w-64 rounded-full bg-white/5"></div>
        <div className="absolute -right-20 top-20 h-40 w-40 rounded-full bg-white/5"></div>
        <div className="absolute bottom-20 right-10 h-20 w-20 rounded-full bg-white/5"></div>
      </section>

      {/* Features Section */}
      <section className="py-20">
        <div className="container mx-auto px-4">
          <div className="mb-12 text-center">
            <h2 className="mb-4 text-3xl font-bold text-gray-900 dark:text-white md:text-4xl">
              Powerful Features for Everyone
            </h2>
            <p className="mx-auto max-w-2xl text-lg text-gray-600 dark:text-gray-400">
              TRIMLY offers specialized tools for both barbers and customers to create the perfect haircut experience.
            </p>
          </div>

          <div className="grid gap-8 md:grid-cols-2 lg:grid-cols-4">
            <div className="card group hover:border-primary hover:shadow-md">
              <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-primary/10 text-primary dark:bg-primary/20">
                <Calendar size={24} />
              </div>
              <h3 className="mb-2 text-xl font-semibold text-gray-900 dark:text-white">
                Smart Scheduling
              </h3>
              <p className="text-gray-600 dark:text-gray-400">
                Effortlessly book appointments and manage your calendar with real-time availability.
              </p>
            </div>

            <div className="card group hover:border-primary hover:shadow-md">
              <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-primary/10 text-primary dark:bg-primary/20">
                <Clock size={24} />
              </div>
              <h3 className="mb-2 text-xl font-semibold text-gray-900 dark:text-white">
                Queue Management
              </h3>
              <p className="text-gray-600 dark:text-gray-400">
                Real-time updates and estimated wait times for a better customer experience.
              </p>
            </div>

            <div className="card group hover:border-primary hover:shadow-md">
              <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-primary/10 text-primary dark:bg-primary/20">
                <MapPin size={24} />
              </div>
              <h3 className="mb-2 text-xl font-semibold text-gray-900 dark:text-white">
                Location Services
              </h3>
              <p className="text-gray-600 dark:text-gray-400">
                Find nearby barbers in Belagavi with ease using our advanced location-based search.
              </p>
            </div>

            <div className="card group hover:border-primary hover:shadow-md">
              <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-primary/10 text-primary dark:bg-primary/20">
                <BarChart size={24} />
              </div>
              <h3 className="mb-2 text-xl font-semibold text-gray-900 dark:text-white">
                Business Insights
              </h3>
              <p className="text-gray-600 dark:text-gray-400">
                Barbers gain valuable insights into their business performance and customer trends.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="bg-gray-100 py-20 dark:bg-gray-800">
        <div className="container mx-auto px-4">
          <div className="grid gap-8 md:grid-cols-2">
            <div className="flex flex-col justify-center">
              <h2 className="mb-4 text-3xl font-bold text-gray-900 dark:text-white md:text-4xl">
                Ready to transform your barbershop experience?
              </h2>
              <p className="mb-8 text-lg text-gray-600 dark:text-gray-400">
                Join TRIMLY today and discover a new way to connect barbers with customers.
                Whether you're cutting hair or getting it cut, we've got you covered.
              </p>
              <div className="flex flex-col space-y-4 sm:flex-row sm:space-x-4 sm:space-y-0">
                <Button
                  onClick={handleGetStarted}
                  className="btn btn-primary px-6 py-3"
                >
                  I'm a Barber
                </Button>
                <Button
                  onClick={handleGetStarted}
                  className="btn btn-secondary px-6 py-3"
                >
                  I'm a Customer
                </Button>
              </div>
            </div>
            <div className="flex justify-center">
              <div className="relative flex max-w-md rounded-xl bg-white p-4 shadow-lg dark:bg-gray-900">
                <div className="absolute -right-4 -top-4 rounded-full bg-primary px-4 py-1 text-sm font-bold text-white">
                  VERIFIED
                </div>
                <div className="mr-4 flex-shrink-0">
                  <img
                    src="https://images.pexels.com/photos/1319459/pexels-photo-1319459.jpeg"
                    alt="Barber"
                    className="h-20 w-20 rounded-full object-cover"
                  />
                </div>
                <div className="flex-grow">
                  <h4 className="text-lg font-semibold text-gray-900 dark:text-white">Fresh Cuts Barbershop</h4>
                  <div className="mb-2 flex items-center text-accent">
                    <Star size={16} fill="currentColor" />
                    <Star size={16} fill="currentColor" />
                    <Star size={16} fill="currentColor" />
                    <Star size={16} fill="currentColor" />
                    <Star size={16} fill="currentColor" />
                    <span className="ml-1 text-sm text-gray-600 dark:text-gray-400">(42 reviews)</span>
                  </div>
                  <div className="mb-2 flex items-center text-sm text-gray-600 dark:text-gray-400">
                    <MapPin size={14} className="mr-1" />
                    <span>Belagavi</span>
                  </div>
                  <div className="flex flex-wrap gap-2">
                    <span className="badge badge-primary">Haircut (₹180)</span>
                    <span className="badge badge-primary">Beard Trim (₹100)</span>
                    <span className="badge badge-success">Available Now</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Testimonials Section */}
      <section className="py-20">
        <div className="container mx-auto px-4">
          <div className="mb-12 text-center">
            <h2 className="mb-4 text-3xl font-bold text-gray-900 dark:text-white md:text-4xl">
              What Our Users Say
            </h2>
            <p className="mx-auto max-w-2xl text-lg text-gray-600 dark:text-gray-400">
              Share your experience with TRIMLY and help others discover the perfect barbershop experience.
            </p>
            <Button
              onClick={() => setShowReviewForm(!showReviewForm)}
              variant="primary"
              className="mt-4"
            >
              {showReviewForm ? 'Close Form' : 'Write a Review'}
            </Button>
          </div>

          {showReviewForm && (
            <div className="mb-8">
              <form onSubmit={handleSubmitReview} className="mx-auto max-w-2xl rounded-lg border p-6 shadow-sm">
                <div className="mb-4">
                  <label className="mb-2 block text-sm font-medium">Your Name</label>
                  <input
                    type="text"
                    value={newReview.name}
                    onChange={(e) => setNewReview({ ...newReview, name: e.target.value })}
                    className="input w-full"
                    placeholder="Enter your name"
                    required
                  />
                </div>

                <div className="mb-4">
                  <label className="mb-2 block text-sm font-medium">I am a:</label>
                  <div className="flex space-x-4">
                    <label className="flex items-center">
                      <input
                        type="radio"
                        value="customer"
                        checked={newReview.role === 'customer'}
                        onChange={(e) => setNewReview({ ...newReview, role: e.target.value })}
                        className="mr-2"
                      />
                      Customer
                    </label>
                    <label className="flex items-center">
                      <input
                        type="radio"
                        value="barber"
                        checked={newReview.role === 'barber'}
                        onChange={(e) => setNewReview({ ...newReview, role: e.target.value })}
                        className="mr-2"
                      />
                      Barber
                    </label>
                  </div>
                </div>

                <div className="mb-4">
                  <label className="mb-2 block text-sm font-medium">Rating</label>
                  <div className="flex space-x-2">
                    {[1, 2, 3, 4, 5].map((rating) => (
                      <button
                        key={rating}
                        type="button"
                        onClick={() => setNewReview({ ...newReview, rating })}
                        className={`text-2xl ${
                          rating <= newReview.rating ? 'text-accent' : 'text-gray-300'
                        }`}
                      >
                        <Star size={24} fill={rating <= newReview.rating ? 'currentColor' : 'none'} />
                      </button>
                    ))}
                  </div>
                </div>

                <div className="mb-4">
                  <label className="mb-2 block text-sm font-medium">Your Review</label>
                  <textarea
                    value={newReview.content}
                    onChange={(e) => setNewReview({ ...newReview, content: e.target.value })}
                    className="input w-full"
                    rows={4}
                    placeholder="Share your experience with TRIMLY..."
                    required
                  />
                </div>

                <div className="flex justify-end">
                  <Button type="submit" variant="primary" rightIcon={<Send size={16} />}>
                    Submit Review
                  </Button>
                </div>
              </form>
            </div>
          )}

          <div className="grid gap-8 md:grid-cols-2 lg:grid-cols-3">
            {reviews.length > 0 ? (
              reviews.map((review) => (
                <div key={review.id} className="card flex h-full flex-col bg-gray-50 dark:bg-gray-800">
                  <div className="mb-4 flex items-center text-accent">
                    {[...Array(review.author.rating)].map((_, i) => (
                      <Star key={i} size={16} fill="currentColor" />
                    ))}
                  </div>
                  <p className="mb-4 flex-grow italic text-gray-700 dark:text-gray-300">
                    "{review.content}"
                  </p>
                  <div className="flex items-center">
                    <img
                      src={review.author.avatar}
                      alt={review.author.name}
                      className="mr-4 h-12 w-12 rounded-full object-cover"
                    />
                    <div>
                      <h4 className="font-semibold text-gray-900 dark:text-white">
                        {review.author.name}
                      </h4>
                      <p className="text-sm text-gray-600 dark:text-gray-400">
                        {review.author.role}
                      </p>
                    </div>
                  </div>
                </div>
              ))
            ) : (
              <div className="lg:col-span-3 text-center text-gray-600 dark:text-gray-400">
                <p>No reviews yet. Be the first to share your experience!</p>
              </div>
            )}
          </div>
        </div>
      </section>

      {/* Trust Factors Section */}
      <section className="bg-gray-100 py-16 dark:bg-gray-800">
        <div className="container mx-auto px-4">
          <div className="grid gap-8 text-center sm:grid-cols-2 lg:grid-cols-4">
            <div className="flex flex-col items-center">
              <div className="mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-primary/10 text-primary dark:bg-primary/20">
                <Shield size={32} />
              </div>
              <h3 className="mb-2 text-xl font-semibold text-gray-900 dark:text-white">Secure Payments</h3>
              <p className="text-gray-600 dark:text-gray-400">
                Your financial information is always protected with encryption.
              </p>
            </div>
            
            <div className="flex flex-col items-center">
              <div className="mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-primary/10 text-primary dark:bg-primary/20">
                <BadgeCheck size={32} />
              </div>
              <h3 className="mb-2 text-xl font-semibold text-gray-900 dark:text-white">Verified Barbers</h3>
              <p className="text-gray-600 dark:text-gray-400">
                All barbers undergo a verification process to ensure quality.
              </p>
            </div>
            
            <div className="flex flex-col items-center">
              <div className="mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-primary/10 text-primary dark:bg-primary/20">
                <Star size={32} />
              </div>
              <h3 className="mb-2 text-xl font-semibold text-gray-900 dark:text-white">Honest Reviews</h3>
              <p className="text-gray-600 dark:text-gray-400">
                Real customer feedback helps you choose the right barber.
              </p>
            </div>
            
            <div className="flex flex-col items-center">
              <div className="mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-primary/10 text-primary dark:bg-primary/20">
                <Scissors size={32} className="rotate-45" />
              </div>
              <h3 className="mb-2 text-xl font-semibold text-gray-900 dark:text-white">Quality Service</h3>
              <p className="text-gray-600 dark:text-gray-400">
                Our platform is designed to elevate barber-customer experiences.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Final CTA Section */}
      <section className="bg-primary py-16 text-white">
        <div className="container mx-auto px-4 text-center">
          <h2 className="mb-6 text-3xl font-bold md:text-4xl">
            Join TRIMLY Today and Transform Your Barber Experience
          </h2>
          <p className="mx-auto mb-8 max-w-2xl text-lg">
            Whether you're a barber looking to grow your business or a customer seeking convenience,
            TRIMLY offers the tools you need to succeed.
          </p>
          <Button
            onClick={handleGetStarted}
            className="inline-block rounded-md bg-white px-8 py-3 font-bold text-primary hover:bg-gray-100"
          >
            Get Started For Free
          </Button>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-gray-900 py-12 text-white">
        <div className="container mx-auto px-4">
          <div className="mb-8 flex items-center justify-center">
            <div className="flex h-10 w-10 items-center justify-center rounded-md bg-white text-primary">
              <Scissors size={20} className="rotate-45" />
            </div>
            <span className="ml-2 text-2xl font-bold">TRIMLY</span>
          </div>
          
          <div className="mb-8 grid gap-8 md:grid-cols-3">
            <div className="text-center md:text-left">
              <h3 className="mb-4 text-lg font-semibold">About TRIMLY</h3>
              <p className="text-gray-400">
                TRIMLY is the ultimate platform connecting barbers and customers for a seamless
                haircut experience. Our mission is to revolutionize the barbershop industry.
              </p>
            </div>
            
            <div className="text-center">
              <h3 className="mb-4 text-lg font-semibold">Quick Links</h3>
              <ul className="space-y-2">
                <li><Link to="/" className="text-gray-400 hover:text-white">Home</Link></li>
                <li><Link to="/login" className="text-gray-400 hover:text-white">Login</Link></li>
                <li>
                  <Button
                    onClick={handleGetStarted}
                    className="text-gray-400 hover:text-white"
                  >
                    Register
                  </Button>
                </li>
              </ul>
            </div>
            
            <div className="text-center md:text-right">
              <h3 className="mb-4 text-lg font-semibold">Contact Us</h3>
              <p className="text-gray-400">
                RLS BCA <br />
                Ganeshpur, Belagavi 591108<br />
                contact@trimly.com<br />
                91
              </p>
            </div>
          </div>
          
          <div className="border-t border-gray-800 pt-8 text-center">
            <p className="text-gray-500">
              &copy; {new Date().getFullYear()} TRIMLY. All rights reserved.
            </p>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default HomePage;