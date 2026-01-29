from reportlab.pdfgen import canvas

c = canvas.Canvas("dummy_resume.pdf")
c.drawString(100, 750, "John Doe")
c.drawString(100, 730, "Software Engineer")
c.save()
