require("dotenv").config();
const nodemailer = require("nodemailer");

// Email configuration
const transporter = nodemailer.createTransport({
  service: "gmail", // or your email service
  auth: {
    user: process.env.EMAIL_USER || "",
    pass: process.env.EMAIL_PASS || "",
  },
});

// Contact form email handler
const sendContactEmail = async (event, context) => {
  console.log("Email handler started");

  try {
    const { name, email, subject, message } = JSON.parse(event.body);
    console.log("Parsed form data:", {
      name,
      email,
      subject,
      message: message,
    });

    // Validate required fields
    if (!name || !email || !subject || !message) {
      console.log("Validation failed - missing fields");
      return {
        statusCode: 400,
        headers: {
          "Content-Type": "application/json",
          "Access-Control-Allow-Origin": "*",
          "Access-Control-Allow-Headers": "Content-Type",
          "Access-Control-Allow-Methods": "POST, OPTIONS",
        },
        body: JSON.stringify({
          success: false,
          message: "All fields are required",
        }),
      };
    }

    // Validate email format
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      console.log("Validation failed - invalid email format");
      return {
        statusCode: 400,
        headers: {
          "Content-Type": "application/json",
          "Access-Control-Allow-Origin": "*",
          "Access-Control-Allow-Headers": "Content-Type",
          "Access-Control-Allow-Methods": "POST, OPTIONS",
        },
        body: JSON.stringify({
          success: false,
          message: "Please provide a valid email address",
        }),
      };
    }

    console.log("Starting email sending process...");

    // Email content
    const mailOptions = {
      from: process.env.EMAIL_USER || "",
      to: process.env.CONTACT_EMAIL || "", // Where you want to receive contact emails
      subject: `New Contact Form Message: ${subject}`,
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; background-color: #f9f9f9;">
          <div style="background-color: #ffffff; padding: 30px; border-radius: 10px; box-shadow: 0 2px 10px rgba(0,0,0,0.1);">
            <h2 style="color: #333; margin-bottom: 20px; border-bottom: 2px solid #007bff; padding-bottom: 10px;">
              New Contact Form Submission
            </h2>
            
            <div style="margin-bottom: 20px;">
              <h3 style="color: #007bff; margin-bottom: 10px;">Contact Details:</h3>
              <p><strong>Name:</strong> ${name}</p>
              <p><strong>Email:</strong> ${email}</p>
              <p><strong>Subject:</strong> ${subject}</p>
            </div>
            
            <div style="margin-bottom: 20px;">
              <h3 style="color: #007bff; margin-bottom: 10px;">Message:</h3>
              <div style="background-color: #f8f9fa; padding: 15px; border-radius: 5px; border-left: 4px solid #007bff;">
                <p style="margin: 0; line-height: 1.6; color: #333;">${message.replace(
                  /\n/g,
                  "<br>"
                )}</p>
              </div>
            </div>
            
            <div style="margin-top: 30px; padding-top: 20px; border-top: 1px solid #eee; font-size: 12px; color: #666;">
              <p>This message was sent from your portfolio contact form.</p>
              <p>Time: ${new Date().toLocaleString()}</p>
            </div>
          </div>
        </div>
      `,
    };

    console.log("Sending notification email...");
    // Send email
    await transporter.sendMail(mailOptions);
    console.log("Notification email sent successfully");

    // Send confirmation email to the user
    const confirmationMailOptions = {
      from: process.env.EMAIL_USER || "",
      to: email,
      subject: "Thank you for your message!",
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; background-color: #f9f9f9;">
          <div style="background-color: #ffffff; padding: 30px; border-radius: 10px; box-shadow: 0 2px 10px rgba(0,0,0,0.1);">
            <h2 style="color: #333; margin-bottom: 20px; border-bottom: 2px solid #28a745; padding-bottom: 10px;">
              Thank you for reaching out!
            </h2>
            
            <p style="color: #333; line-height: 1.6; margin-bottom: 20px;">
              Hi ${name},
            </p>
            
            <p style="color: #333; line-height: 1.6; margin-bottom: 20px;">
              Thank you for your message! I've received your contact form submission and will get back to you as soon as possible.
            </p>
            
            <div style="background-color: #f8f9fa; padding: 15px; border-radius: 5px; margin-bottom: 20px;">
              <h4 style="color: #007bff; margin-bottom: 10px;">Your Message Details:</h4>
              <p><strong>Subject:</strong> ${subject}</p>
              <p><strong>Message:</strong></p>
              <div style="background-color: #ffffff; padding: 10px; border-radius: 3px; border-left: 3px solid #007bff;">
                <p style="margin: 0; line-height: 1.6;">${message.replace(
                  /\n/g,
                  "<br>"
                )}</p>
              </div>
            </div>
            
            <p style="color: #333; line-height: 1.6; margin-bottom: 20px;">
              I typically respond within 24 hours. If you have any urgent inquiries, please don't hesitate to reach out through other channels.
            </p>
            
            <div style="margin-top: 30px; padding-top: 20px; border-top: 1px solid #eee; font-size: 12px; color: #666;">
              <p>This is an automated confirmation email. Please do not reply to this message.</p>
            </div>
          </div>
        </div>
      `,
    };

    console.log("Sending confirmation email...");
    await transporter.sendMail(confirmationMailOptions);
    console.log("Confirmation email sent successfully");

    console.log("Email handler completed successfully");
    return {
      statusCode: 200,
      headers: {
        "Content-Type": "application/json",
        "Access-Control-Allow-Origin": "*",
        "Access-Control-Allow-Headers": "Content-Type",
        "Access-Control-Allow-Methods": "POST, OPTIONS",
      },
      body: JSON.stringify({
        success: true,
        message:
          "Message sent successfully! You will receive a confirmation email shortly.",
      }),
    };
  } catch (error) {
    console.error("Email sending error:", error);
    return {
      statusCode: 500,
      headers: {
        "Content-Type": "application/json",
        "Access-Control-Allow-Origin": "*",
        "Access-Control-Allow-Headers": "Content-Type",
        "Access-Control-Allow-Methods": "POST, OPTIONS",
      },
      body: JSON.stringify({
        success: false,
        message: "Failed to send message. Please try again later.",
      }),
    };
  }
};

module.exports = {
  sendContactEmail,
};
