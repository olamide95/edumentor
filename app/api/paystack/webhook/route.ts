import { NextRequest, NextResponse } from 'next/server';
import crypto from 'crypto';
import { createUserWithEmailAndPassword, updateProfile } from 'firebase/auth';
import { doc, setDoc, serverTimestamp, getDoc } from 'firebase/firestore';
import { auth, db } from '@/lib/firebase/config';

export async function POST(request: NextRequest) {
  try {
    const secret = process.env.PAYSTACK_SECRET_KEY || process.env.NEXT_PUBLIC_PAYSTACK_SECRET_KEY;
    
    if (!secret) {
      return NextResponse.json(
        { error: 'Paystack secret key not configured' },
        { status: 500 }
      );
    }

    const body = await request.text();
    
    // Verify webhook signature
    const hash = crypto
      .createHmac('sha512', secret)
      .update(body)
      .digest('hex');
    
    const signature = request.headers.get('x-paystack-signature');
    
    if (hash !== signature) {
      console.error('Invalid webhook signature');
      return NextResponse.json(
        { error: 'Invalid signature' },
        { status: 401 }
      );
    }
    
    const event = JSON.parse(body);
    console.log('Paystack webhook received:', event.event);
    
    // Handle different webhook events
    switch (event.event) {
      case 'charge.success':
        await handleSuccessfulPayment(event.data);
        break;
        
      case 'charge.failed':
        await handleFailedPayment(event.data);
        break;
        
      case 'transfer.success':
        await handleTransferSuccess(event.data);
        break;
        
      default:
        console.log(`Unhandled event type: ${event.event}`);
    }
    
    return NextResponse.json({ received: true, status: 'processed' });
  } catch (error: any) {
    console.error('Webhook error:', error);
    return NextResponse.json(
      { error: 'Webhook handler failed', details: error.message },
      { status: 400 }
    );
  }
}

async function handleSuccessfulPayment(data: any) {
  const { reference, metadata, customer } = data;
  
  console.log('Payment successful:', {
    reference,
    metadata,
    customerEmail: customer?.email
  });
  
  // Handle tutor registration payment
  if (metadata?.applicationType === 'tutor_registration') {
    await handleTutorRegistrationPayment(data);
  }
}

async function handleTutorRegistrationPayment(paymentData: any) {
  try {
    const { reference, metadata, customer, amount } = paymentData;
    const { userId, applicationId, tutorName, tutorEmail } = metadata;
    
    const email = customer?.email || tutorEmail;
    
    if (!email) {
      console.error('No email provided for tutor registration');
      return;
    }
    
    // Generate a random password for the tutor
    const password = generateRandomPassword();
    
    // 1. Create Firebase auth account for tutor
    const userCredential = await createUserWithEmailAndPassword(auth, email, password);
    
    // 2. Update user profile
    await updateProfile(userCredential.user, {
      displayName: tutorName || 'Tutor'
    });
    
    // 3. Create user document in Firestore
    const userData = {
      uid: userCredential.user.uid,
      email: email,
      firstName: metadata.firstName || '',
      lastName: metadata.lastName || '',
      phone: metadata.phone || '',
      role: 'tutor',
      tutorStatus: 'pending_review', // After payment, waiting for admin review
      isEmailVerified: false,
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp(),
      paymentReference: reference,
      applicationId: applicationId,
      amountPaid: amount / 100, // Convert from kobo to naira
    };
    
    await setDoc(doc(db, 'users', userCredential.user.uid), userData);
    
    // 4. Update tutor application document
    const applicationData = {
      status: 'pending_review',
      paymentStatus: 'completed',
      paymentReference: reference,
      paidAt: serverTimestamp(),
      userId: userCredential.user.uid,
      updatedAt: serverTimestamp(),
    };
    
    await setDoc(doc(db, 'tutorApplications', applicationId), applicationData, { merge: true });
    
    // 5. Create initial tutor profile
    const tutorProfileData = {
      userId: userCredential.user.uid,
      email: email,
      firstName: metadata.firstName || '',
      lastName: metadata.lastName || '',
      phone: metadata.phone || '',
      status: 'pending_review',
      applicationId: applicationId,
      paymentReference: reference,
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp(),
    };
    
    await setDoc(doc(db, 'tutors', userCredential.user.uid), tutorProfileData);
    
    console.log('Tutor account created successfully:', {
      uid: userCredential.user.uid,
      email: email,
      applicationId: applicationId
    });
    
    // 6. Send welcome email with login credentials
    await sendWelcomeEmail(email, tutorName, password);
    
  } catch (error: any) {
    console.error('Error creating tutor account:', error);
    
    // Log the error to a separate collection for debugging
    await setDoc(doc(db, 'paymentErrors', reference), {
      error: error.message,
      data: paymentData,
      timestamp: serverTimestamp()
    });
  }
}

async function handleFailedPayment(data: any) {
  const { reference, metadata } = data;
  
  console.log('Payment failed:', reference);
  
  if (metadata?.applicationType === 'tutor_registration') {
    // Update application status to payment failed
    await setDoc(doc(db, 'tutorApplications', metadata.applicationId), {
      status: 'payment_failed',
      paymentStatus: 'failed',
      paymentReference: reference,
      updatedAt: serverTimestamp(),
    }, { merge: true });
  }
}

async function handleTransferSuccess(data: any) {
  console.log('Transfer successful:', data.reference);
  // Handle tutor payout logic here
}

function generateRandomPassword(length: number = 12): string {
  const charset = 'abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789!@#$%^&*';
  let password = '';
  for (let i = 0; i < length; i++) {
    const randomIndex = Math.floor(Math.random() * charset.length);
    password += charset[randomIndex];
  }
  return password;
}

async function sendWelcomeEmail(email: string, name: string, password: string) {
  try {
    // In a production app, use a proper email service like SendGrid, Resend, etc.
    const response = await fetch('/api/send-email', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        to: email,
        subject: 'Welcome to Edumentor - Your Tutor Account',
        template: 'welcome-tutor',
        data: {
          name: name,
          email: email,
          password: password,
          loginUrl: `${process.env.NEXT_PUBLIC_APP_URL}/login`
        }
      }),
    });
    
    if (!response.ok) {
      console.error('Failed to send welcome email');
    }
  } catch (error) {
    console.error('Error sending welcome email:', error);
  }
}