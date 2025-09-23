# Marketing Integration Guide - Household Planet Kenya

## Overview

This guide provides comprehensive instructions for integrating marketing tools, analytics, and campaigns with the Household Planet Kenya e-commerce platform.

---

## Analytics Integration

### Google Analytics 4 (GA4)

**Setup Instructions:**

1. **Create GA4 Property**
   - Go to Google Analytics
   - Create new property for householdplanetkenya.co.ke
   - Get Measurement ID (G-XXXXXXXXXX)

2. **Frontend Integration**
```javascript
// pages/_app.tsx
import { useEffect } from 'react';
import { useRouter } from 'next/router';

// Google Analytics
export const GA_TRACKING_ID = process.env.NEXT_PUBLIC_GA_ID;

// Track page views
export const pageview = (url) => {
  window.gtag('config', GA_TRACKING_ID, {
    page_path: url,
  });
};

// Track events
export const event = ({ action, category, label, value }) => {
  window.gtag('event', action, {
    event_category: category,
    event_label: label,
    value: value,
  });
};

function MyApp({ Component, pageProps }) {
  const router = useRouter();

  useEffect(() => {
    const handleRouteChange = (url) => {
      pageview(url);
    };
    
    router.events.on('routeChangeComplete', handleRouteChange);
    return () => {
      router.events.off('routeChangeComplete', handleRouteChange);
    };
  }, [router.events]);

  return <Component {...pageProps} />;
}
```

3. **E-commerce Tracking**
```javascript
// Track purchases
export const trackPurchase = (transactionData) => {
  window.gtag('event', 'purchase', {
    transaction_id: transactionData.orderId,
    value: transactionData.total,
    currency: 'KES',
    items: transactionData.items.map(item => ({
      item_id: item.id,
      item_name: item.name,
      category: item.category,
      quantity: item.quantity,
      price: item.price
    }))
  });
};

// Track add to cart
export const trackAddToCart = (item) => {
  window.gtag('event', 'add_to_cart', {
    currency: 'KES',
    value: item.price,
    items: [{
      item_id: item.id,
      item_name: item.name,
      category: item.category,
      quantity: 1,
      price: item.price
    }]
  });
};
```

### Facebook Pixel

**Integration Setup:**
```javascript
// components/FacebookPixel.tsx
import { useEffect } from 'react';
import { useRouter } from 'next/router';

const FacebookPixel = () => {
  const router = useRouter();

  useEffect(() => {
    import('react-facebook-pixel')
      .then((x) => x.default)
      .then((ReactPixel) => {
        ReactPixel.init(process.env.NEXT_PUBLIC_FACEBOOK_PIXEL_ID);
        ReactPixel.pageView();

        router.events.on('routeChangeComplete', () => {
          ReactPixel.pageView();
        });
      });
  }, [router.events]);

  return null;
};

export default FacebookPixel;
```

**E-commerce Events:**
```javascript
// Track purchase
ReactPixel.track('Purchase', {
  value: orderTotal,
  currency: 'KES',
  content_ids: productIds,
  content_type: 'product'
});

// Track add to cart
ReactPixel.track('AddToCart', {
  value: productPrice,
  currency: 'KES',
  content_ids: [productId],
  content_type: 'product'
});
```

---

## Email Marketing Integration

### Mailchimp Integration

**API Setup:**
```javascript
// lib/mailchimp.js
const mailchimp = require('@mailchimp/mailchimp_marketing');

mailchimp.setConfig({
  apiKey: process.env.MAILCHIMP_API_KEY,
  server: process.env.MAILCHIMP_SERVER_PREFIX,
});

export const addToAudience = async (email, firstName, lastName) => {
  try {
    const response = await mailchimp.lists.addListMember(
      process.env.MAILCHIMP_AUDIENCE_ID,
      {
        email_address: email,
        status: 'subscribed',
        merge_fields: {
          FNAME: firstName,
          LNAME: lastName,
        },
      }
    );
    return response;
  } catch (error) {
    console.error('Mailchimp error:', error);
    throw error;
  }
};
```

**Newsletter Signup Component:**
```javascript
// components/NewsletterSignup.tsx
import { useState } from 'react';

const NewsletterSignup = () => {
  const [email, setEmail] = useState('');
  const [status, setStatus] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    setStatus('loading');

    try {
      const response = await fetch('/api/newsletter/subscribe', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email }),
      });

      if (response.ok) {
        setStatus('success');
        setEmail('');
      } else {
        setStatus('error');
      }
    } catch (error) {
      setStatus('error');
    }
  };

  return (
    <form onSubmit={handleSubmit} className="newsletter-form">
      <input
        type="email"
        value={email}
        onChange={(e) => setEmail(e.target.value)}
        placeholder="Enter your email"
        required
      />
      <button type="submit" disabled={status === 'loading'}>
        {status === 'loading' ? 'Subscribing...' : 'Subscribe'}
      </button>
      {status === 'success' && <p>Successfully subscribed!</p>}
      {status === 'error' && <p>Subscription failed. Please try again.</p>}
    </form>
  );
};
```

### Email Automation

**Welcome Email Series:**
```javascript
// lib/email-automation.js
export const triggerWelcomeSeries = async (customerData) => {
  const emails = [
    {
      delay: 0, // Immediate
      template: 'welcome',
      subject: 'Welcome to Household Planet Kenya! 🏠',
    },
    {
      delay: 24 * 60 * 60 * 1000, // 24 hours
      template: 'getting-started',
      subject: 'Get the most out of your shopping experience',
    },
    {
      delay: 7 * 24 * 60 * 60 * 1000, // 7 days
      template: 'first-purchase-incentive',
      subject: 'Special 15% discount just for you!',
    },
  ];

  for (const email of emails) {
    setTimeout(async () => {
      await sendEmail({
        to: customerData.email,
        subject: email.subject,
        template: email.template,
        data: customerData,
      });
    }, email.delay);
  }
};
```

---

## Social Media Integration

### WhatsApp Business API

**Setup Configuration:**
```javascript
// lib/whatsapp.js
const axios = require('axios');

const WHATSAPP_API_URL = 'https://graph.facebook.com/v17.0';
const PHONE_NUMBER_ID = process.env.WHATSAPP_PHONE_NUMBER_ID;
const ACCESS_TOKEN = process.env.WHATSAPP_ACCESS_TOKEN;

export const sendWhatsAppMessage = async (to, message) => {
  try {
    const response = await axios.post(
      `${WHATSAPP_API_URL}/${PHONE_NUMBER_ID}/messages`,
      {
        messaging_product: 'whatsapp',
        to: to,
        type: 'text',
        text: { body: message },
      },
      {
        headers: {
          'Authorization': `Bearer ${ACCESS_TOKEN}`,
          'Content-Type': 'application/json',
        },
      }
    );
    return response.data;
  } catch (error) {
    console.error('WhatsApp API error:', error);
    throw error;
  }
};

export const sendOrderConfirmation = async (customerPhone, orderData) => {
  const message = `
🎉 Order Confirmed! #${orderData.id}

📦 Items: ${orderData.items.map(item => item.name).join(', ')}
💰 Total: KES ${orderData.total.toLocaleString()}
🚚 Delivery: ${orderData.estimatedDelivery}

Track your order: ${process.env.NEXT_PUBLIC_SITE_URL}/orders/${orderData.id}

Questions? Reply to this message!
  `;

  return await sendWhatsAppMessage(customerPhone, message.trim());
};
```

### Social Media Sharing

**Share Buttons Component:**
```javascript
// components/SocialShare.tsx
import { Facebook, Twitter, WhatsApp, Copy } from 'lucide-react';

const SocialShare = ({ url, title, description, image }) => {
  const shareUrls = {
    facebook: `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(url)}`,
    twitter: `https://twitter.com/intent/tweet?url=${encodeURIComponent(url)}&text=${encodeURIComponent(title)}`,
    whatsapp: `https://wa.me/?text=${encodeURIComponent(`${title} - ${url}`)}`,
  };

  const copyToClipboard = () => {
    navigator.clipboard.writeText(url);
    // Show success message
  };

  return (
    <div className="social-share">
      <h3>Share this product:</h3>
      <div className="share-buttons">
        <a href={shareUrls.facebook} target="_blank" rel="noopener noreferrer">
          <Facebook size={20} /> Facebook
        </a>
        <a href={shareUrls.twitter} target="_blank" rel="noopener noreferrer">
          <Twitter size={20} /> Twitter
        </a>
        <a href={shareUrls.whatsapp} target="_blank" rel="noopener noreferrer">
          <WhatsApp size={20} /> WhatsApp
        </a>
        <button onClick={copyToClipboard}>
          <Copy size={20} /> Copy Link
        </button>
      </div>
    </div>
  );
};
```

---

## SEO and Content Marketing

### SEO Optimization

**Meta Tags Component:**
```javascript
// components/SEOHead.tsx
import Head from 'next/head';

const SEOHead = ({ 
  title, 
  description, 
  keywords, 
  image, 
  url, 
  type = 'website' 
}) => {
  const siteTitle = 'Household Planet Kenya';
  const fullTitle = title ? `${title} | ${siteTitle}` : siteTitle;

  return (
    <Head>
      <title>{fullTitle}</title>
      <meta name="description" content={description} />
      <meta name="keywords" content={keywords} />
      
      {/* Open Graph */}
      <meta property="og:title" content={fullTitle} />
      <meta property="og:description" content={description} />
      <meta property="og:image" content={image} />
      <meta property="og:url" content={url} />
      <meta property="og:type" content={type} />
      <meta property="og:site_name" content={siteTitle} />
      
      {/* Twitter Card */}
      <meta name="twitter:card" content="summary_large_image" />
      <meta name="twitter:title" content={fullTitle} />
      <meta name="twitter:description" content={description} />
      <meta name="twitter:image" content={image} />
      
      {/* Canonical URL */}
      <link rel="canonical" href={url} />
    </Head>
  );
};
```

**Structured Data:**
```javascript
// lib/structured-data.js
export const generateProductSchema = (product) => {
  return {
    '@context': 'https://schema.org',
    '@type': 'Product',
    name: product.name,
    description: product.description,
    image: product.images,
    brand: {
      '@type': 'Brand',
      name: 'Household Planet Kenya',
    },
    offers: {
      '@type': 'Offer',
      price: product.price,
      priceCurrency: 'KES',
      availability: product.inStock ? 'InStock' : 'OutOfStock',
      seller: {
        '@type': 'Organization',
        name: 'Household Planet Kenya',
      },
    },
    aggregateRating: product.rating && {
      '@type': 'AggregateRating',
      ratingValue: product.rating.average,
      reviewCount: product.rating.count,
    },
  };
};
```

### Blog Integration

**Blog Post Component:**
```javascript
// components/BlogPost.tsx
import { SEOHead } from './SEOHead';
import { SocialShare } from './SocialShare';

const BlogPost = ({ post }) => {
  const postUrl = `${process.env.NEXT_PUBLIC_SITE_URL}/blog/${post.slug}`;

  return (
    <>
      <SEOHead
        title={post.title}
        description={post.excerpt}
        keywords={post.tags.join(', ')}
        image={post.featuredImage}
        url={postUrl}
        type="article"
      />
      
      <article className="blog-post">
        <header>
          <h1>{post.title}</h1>
          <div className="post-meta">
            <time dateTime={post.publishedAt}>
              {new Date(post.publishedAt).toLocaleDateString()}
            </time>
            <span>By {post.author}</span>
          </div>
        </header>
        
        <div className="post-content" dangerouslySetInnerHTML={{ __html: post.content }} />
        
        <footer>
          <div className="post-tags">
            {post.tags.map(tag => (
              <span key={tag} className="tag">{tag}</span>
            ))}
          </div>
          
          <SocialShare
            url={postUrl}
            title={post.title}
            description={post.excerpt}
            image={post.featuredImage}
          />
        </footer>
      </article>
    </>
  );
};
```

---

## Customer Reviews and Testimonials

### Review Collection System

**Review Request Automation:**
```javascript
// lib/review-automation.js
export const scheduleReviewRequest = async (orderId) => {
  const order = await getOrder(orderId);
  
  // Schedule review request 7 days after delivery
  const reviewDate = new Date(order.deliveredAt);
  reviewDate.setDate(reviewDate.getDate() + 7);
  
  await scheduleEmail({
    to: order.customer.email,
    template: 'review-request',
    scheduledFor: reviewDate,
    data: {
      customerName: order.customer.name,
      orderId: order.id,
      items: order.items,
      reviewUrl: `${process.env.NEXT_PUBLIC_SITE_URL}/reviews/new?order=${order.id}`,
    },
  });
};
```

**Review Display Component:**
```javascript
// components/ProductReviews.tsx
import { Star } from 'lucide-react';

const ProductReviews = ({ productId, reviews }) => {
  const averageRating = reviews.reduce((sum, review) => sum + review.rating, 0) / reviews.length;

  return (
    <div className="product-reviews">
      <div className="reviews-summary">
        <div className="average-rating">
          <span className="rating-number">{averageRating.toFixed(1)}</span>
          <div className="stars">
            {[1, 2, 3, 4, 5].map(star => (
              <Star
                key={star}
                size={20}
                fill={star <= averageRating ? '#fbbf24' : 'none'}
                color={star <= averageRating ? '#fbbf24' : '#d1d5db'}
              />
            ))}
          </div>
          <span className="review-count">({reviews.length} reviews)</span>
        </div>
      </div>
      
      <div className="reviews-list">
        {reviews.map(review => (
          <div key={review.id} className="review">
            <div className="review-header">
              <span className="reviewer-name">{review.customerName}</span>
              <div className="review-rating">
                {[1, 2, 3, 4, 5].map(star => (
                  <Star
                    key={star}
                    size={16}
                    fill={star <= review.rating ? '#fbbf24' : 'none'}
                    color={star <= review.rating ? '#fbbf24' : '#d1d5db'}
                  />
                ))}
              </div>
              <time className="review-date">
                {new Date(review.createdAt).toLocaleDateString()}
              </time>
            </div>
            <p className="review-content">{review.content}</p>
          </div>
        ))}
      </div>
    </div>
  );
};
```

---

## Affiliate Marketing

### Affiliate Program Setup

**Affiliate Tracking:**
```javascript
// lib/affiliate-tracking.js
export const trackAffiliateClick = async (affiliateCode, productId, visitorId) => {
  await prisma.affiliateClick.create({
    data: {
      affiliateCode,
      productId,
      visitorId,
      timestamp: new Date(),
      ipAddress: getClientIP(),
      userAgent: getUserAgent(),
    },
  });
};

export const trackAffiliateConversion = async (orderId, affiliateCode) => {
  const order = await getOrder(orderId);
  const affiliate = await getAffiliateByCode(affiliateCode);
  
  const commission = calculateCommission(order.total, affiliate.commissionRate);
  
  await prisma.affiliateConversion.create({
    data: {
      orderId,
      affiliateId: affiliate.id,
      commissionAmount: commission,
      orderTotal: order.total,
      status: 'pending',
    },
  });
  
  // Notify affiliate
  await sendAffiliateNotification(affiliate, {
    type: 'conversion',
    orderId,
    commission,
  });
};
```

### Referral Program

**Referral System:**
```javascript
// components/ReferralProgram.tsx
const ReferralProgram = ({ user }) => {
  const referralCode = user.referralCode;
  const referralUrl = `${process.env.NEXT_PUBLIC_SITE_URL}?ref=${referralCode}`;
  
  const copyReferralLink = () => {
    navigator.clipboard.writeText(referralUrl);
    // Show success message
  };
  
  return (
    <div className="referral-program">
      <h3>Refer Friends & Earn</h3>
      <p>Share your referral link and earn KES 100 for each friend who makes their first purchase!</p>
      
      <div className="referral-link">
        <input type="text" value={referralUrl} readOnly />
        <button onClick={copyReferralLink}>Copy Link</button>
      </div>
      
      <div className="referral-stats">
        <div className="stat">
          <span className="number">{user.referralStats.totalReferrals}</span>
          <span className="label">Friends Referred</span>
        </div>
        <div className="stat">
          <span className="number">KES {user.referralStats.totalEarnings}</span>
          <span className="label">Total Earnings</span>
        </div>
      </div>
    </div>
  );
};
```

---

## Marketing Automation

### Customer Segmentation

**Segmentation Logic:**
```javascript
// lib/customer-segmentation.js
export const segmentCustomers = async () => {
  const segments = {
    newCustomers: await prisma.user.findMany({
      where: {
        createdAt: {
          gte: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000), // Last 30 days
        },
        orders: {
          none: {},
        },
      },
    }),
    
    firstTimeBuyers: await prisma.user.findMany({
      where: {
        orders: {
          some: {
            createdAt: {
              gte: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000), // Last 7 days
            },
          },
        },
        _count: {
          orders: 1,
        },
      },
    }),
    
    loyalCustomers: await prisma.user.findMany({
      where: {
        _count: {
          orders: {
            gte: 5,
          },
        },
        orders: {
          some: {
            createdAt: {
              gte: new Date(Date.now() - 90 * 24 * 60 * 60 * 1000), // Last 90 days
            },
          },
        },
      },
    }),
    
    atRiskCustomers: await prisma.user.findMany({
      where: {
        orders: {
          some: {
            createdAt: {
              lte: new Date(Date.now() - 60 * 24 * 60 * 60 * 1000), // More than 60 days ago
            },
          },
          none: {
            createdAt: {
              gte: new Date(Date.now() - 60 * 24 * 60 * 60 * 1000), // No orders in last 60 days
            },
          },
        },
      },
    }),
  };
  
  return segments;
};
```

### Abandoned Cart Recovery

**Cart Abandonment Tracking:**
```javascript
// lib/cart-abandonment.js
export const trackCartAbandonment = async (userId, cartItems) => {
  await prisma.abandonedCart.create({
    data: {
      userId,
      items: JSON.stringify(cartItems),
      totalValue: cartItems.reduce((sum, item) => sum + (item.price * item.quantity), 0),
      abandonedAt: new Date(),
    },
  });
  
  // Schedule recovery emails
  scheduleAbandonedCartEmails(userId, cartItems);
};

const scheduleAbandonedCartEmails = (userId, cartItems) => {
  const emails = [
    { delay: 1 * 60 * 60 * 1000, template: 'cart-reminder-1' }, // 1 hour
    { delay: 24 * 60 * 60 * 1000, template: 'cart-reminder-2' }, // 24 hours
    { delay: 72 * 60 * 60 * 1000, template: 'cart-reminder-3' }, // 72 hours
  ];
  
  emails.forEach(email => {
    setTimeout(async () => {
      const user = await getUser(userId);
      await sendEmail({
        to: user.email,
        template: email.template,
        data: { user, cartItems },
      });
    }, email.delay);
  });
};
```

---

## Performance Tracking

### Marketing Attribution

**Attribution Tracking:**
```javascript
// lib/attribution.js
export const trackAttribution = (req, res, next) => {
  const utmParams = {
    source: req.query.utm_source,
    medium: req.query.utm_medium,
    campaign: req.query.utm_campaign,
    term: req.query.utm_term,
    content: req.query.utm_content,
  };
  
  const referrer = req.get('Referrer');
  const userAgent = req.get('User-Agent');
  
  // Store attribution data in session
  req.session.attribution = {
    ...utmParams,
    referrer,
    userAgent,
    timestamp: new Date(),
  };
  
  next();
};

export const attributeConversion = async (orderId, sessionData) => {
  if (sessionData.attribution) {
    await prisma.conversionAttribution.create({
      data: {
        orderId,
        source: sessionData.attribution.source,
        medium: sessionData.attribution.medium,
        campaign: sessionData.attribution.campaign,
        referrer: sessionData.attribution.referrer,
        attributionTimestamp: sessionData.attribution.timestamp,
      },
    });
  }
};
```

### Marketing ROI Calculation

**ROI Tracking:**
```javascript
// lib/marketing-roi.js
export const calculateCampaignROI = async (campaignId) => {
  const campaign = await prisma.marketingCampaign.findUnique({
    where: { id: campaignId },
    include: {
      conversions: {
        include: {
          order: true,
        },
      },
    },
  });
  
  const totalSpend = campaign.budget;
  const totalRevenue = campaign.conversions.reduce(
    (sum, conversion) => sum + conversion.order.total,
    0
  );
  
  const roi = ((totalRevenue - totalSpend) / totalSpend) * 100;
  
  return {
    campaignId,
    totalSpend,
    totalRevenue,
    roi,
    conversions: campaign.conversions.length,
    costPerConversion: totalSpend / campaign.conversions.length,
  };
};
```

---

## Integration Checklist

### Pre-Launch Setup
- [ ] Google Analytics 4 configured
- [ ] Facebook Pixel installed
- [ ] Email marketing platform connected
- [ ] WhatsApp Business API setup
- [ ] SEO meta tags implemented
- [ ] Social sharing buttons added
- [ ] Review system activated
- [ ] Attribution tracking enabled

### Post-Launch Monitoring
- [ ] Analytics data flowing correctly
- [ ] Email campaigns sending successfully
- [ ] Social media integrations working
- [ ] Review requests being sent
- [ ] Attribution data being captured
- [ ] ROI calculations accurate

### Monthly Reviews
- [ ] Analytics performance review
- [ ] Email campaign effectiveness
- [ ] Social media engagement analysis
- [ ] SEO ranking improvements
- [ ] Customer feedback analysis
- [ ] Marketing ROI assessment

---

*This marketing integration guide should be updated as new tools and strategies are implemented.*