import pdfplumber

def extract_text_from_pdf(pdf_path):
    """
    Extracts all text from a PDF file, page by page.
    """
    full_text = ""
    try:
        with pdfplumber.open(pdf_path) as pdf:
            for page in pdf.pages:
                text = page.extract_text()
                if text:
                    full_text += text + "\n"
    except Exception as e:
        print(f"Error reading PDF {pdf_path}: {e}")
        return None
    return full_text

pdf_file_path = r"C:\Users\Admin\Downloads\Resume.pdf"
resume_content = extract_text_from_pdf(pdf_file_path)

if resume_content:
    print(resume_content)
else:
    print("Failed to extract text.")