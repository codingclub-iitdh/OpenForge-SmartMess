import PyPDF2

def read_pdf():
    try:
        reader = PyPDF2.PdfReader('C:/Users/Mahesh/OneDrive/Desktop/SmartMess/revised mess menu.pdf')
        text = ""
        for page in reader.pages:
            text += page.extract_text() + "\n"
        print(text)
    except Exception as e:
        print(f"Error: {e}")

if __name__ == "__main__":
    read_pdf()
