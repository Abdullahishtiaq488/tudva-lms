// src/utils/email.ts
import { Resend } from 'resend';
import ejs from 'ejs';
import path from 'path';
import { AppError } from '../middleware/errorHandler.middleware';

const resend = new Resend(process.env.RESEND_API_KEY);

interface EmailContext {
  [key: string]: string | number | boolean | undefined | null;
}

export const sendEmail = async (to: string, subject: string, url: string, template: string, context: EmailContext = {}) => {
  if (!to || !subject || !template) {
    console.error("Email sending failed: Missing parameters.");
    throw new AppError("Email sending failed: Missing parameters.", 400); // Use AppError
  }

  try {
    const templatePath = path.join(__dirname, '..', 'emails', `${template}.ejs`); // Correct path
    const html = await renderTemplate(templatePath, {
        baseURL: process.env.BASE_URL,
        username: context.name,
        url: url,
        logoUrl: 'https://tudva.vercel.app/_next/static/media/logo.58c53912.svg',
    }); // Await the rendered template

    const mailOptions = {
      from: 'Tudva <onboarding@resend.dev>', // Use a default and a better format
      to: process.env.RESEND_SENDDER_EMAIL || to, // Use the 'to' parameter directly
      subject: subject,
      html: html, // Use the rendered HTML
    };

    const { data, error } = await resend.emails.send(mailOptions);


    if (error) {
        console.error('Error sending email via Resend:', error);
        throw new AppError(`Failed to send email via Resend: ${error.message}`, 500); // More specific error
    }
      console.log('Email sent successfully via Resend:', data);
    return { success: true, messageId: data?.id }; // Access id safely

  } catch (error: any) {
    console.error('Error sending email:', error);
    throw new AppError(`Failed to send email: ${error.message}`, 500);
  }
};

// Use async/await with ejs.renderFile
const renderTemplate = async (templatePath: string, context: EmailContext): Promise<string> => { // Return a Promise<string>
    try{
        const renderedHtml = await ejs.renderFile(templatePath, { baseUrl: process.env.BASE_URL, ...context });
        return renderedHtml;
    }
    catch(error: any){
        console.error('Error rendering email template', error);
        throw new AppError(`Error on rendering email template: ${error.message}`, 500)
    }
};