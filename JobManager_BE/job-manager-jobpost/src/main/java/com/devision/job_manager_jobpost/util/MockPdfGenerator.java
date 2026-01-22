package com.devision.job_manager_jobpost.util;

import lombok.extern.slf4j.Slf4j;
import org.apache.pdfbox.pdmodel.PDDocument;
import org.apache.pdfbox.pdmodel.PDPage;
import org.apache.pdfbox.pdmodel.PDPageContentStream;
import org.apache.pdfbox.pdmodel.common.PDRectangle;
import org.apache.pdfbox.pdmodel.font.PDType1Font;
import org.springframework.stereotype.Component;

import java.io.ByteArrayOutputStream;
import java.io.IOException;
import java.util.ArrayList;
import java.util.List;

/**
 * Utility class for generating mock PDF documents.
 * Used by MockApplicationServiceImpl to create resume and cover letter PDFs on-the-fly.
 */
@Component
@Slf4j
public class MockPdfGenerator {

    private static final float FONT_SIZE = 12;
    private static final float TITLE_FONT_SIZE = 18;
    private static final float LEADING = 14.5f; // Line spacing
    private static final float MARGIN = 50;
    private static final float PAGE_WIDTH = PDRectangle.A4.getWidth();
    private static final float PAGE_HEIGHT = PDRectangle.A4.getHeight();

    /**
     * Generate a PDF document with the given title and content.
     *
     * @param title The document title (displayed at the top)
     * @param content The main content text (supports multi-line)
     * @return PDF file as byte array
     */
    public byte[] generatePdf(String title, String content) {
        log.debug("Generating PDF with title: {}", title);

        try (PDDocument document = new PDDocument();
             ByteArrayOutputStream outputStream = new ByteArrayOutputStream()) {

            // Create first page
            PDPage page = new PDPage(PDRectangle.A4);
            document.addPage(page);

            // Start content stream
            PDPageContentStream contentStream = new PDPageContentStream(document, page);

            float yPosition = PAGE_HEIGHT - MARGIN;

            // Write title
            contentStream.beginText();
            contentStream.setFont(PDType1Font.HELVETICA_BOLD, TITLE_FONT_SIZE);
            contentStream.newLineAtOffset(MARGIN, yPosition);
            contentStream.showText(title);
            contentStream.endText();

            yPosition -= TITLE_FONT_SIZE + 20; // Move down after title

            // Write content
            contentStream.setFont(PDType1Font.HELVETICA, FONT_SIZE);

            // Split content into lines and handle page breaks
            List<String> lines = splitIntoLines(content, PAGE_WIDTH - (2 * MARGIN));

            for (String line : lines) {
                // Check if we need a new page
                if (yPosition < MARGIN + LEADING) {
                    contentStream.close();
                    page = new PDPage(PDRectangle.A4);
                    document.addPage(page);
                    contentStream = new PDPageContentStream(document, page);
                    contentStream.setFont(PDType1Font.HELVETICA, FONT_SIZE);
                    yPosition = PAGE_HEIGHT - MARGIN;
                }

                // Write line
                contentStream.beginText();
                contentStream.newLineAtOffset(MARGIN, yPosition);
                contentStream.showText(line);
                contentStream.endText();

                yPosition -= LEADING;
            }

            contentStream.close();

            // Save to byte array
            document.save(outputStream);

            byte[] pdfBytes = outputStream.toByteArray();
            log.debug("PDF generated successfully, size: {} bytes", pdfBytes.length);

            return pdfBytes;

        } catch (IOException e) {
            log.error("Error generating PDF", e);
            throw new RuntimeException("Failed to generate PDF document", e);
        }
    }

    /**
     * Split text into lines that fit within the specified width.
     * Handles word wrapping and preserves existing line breaks.
     *
     * @param text The text to split
     * @param maxWidth Maximum width in points
     * @return List of lines
     */
    private List<String> splitIntoLines(String text, float maxWidth) {
        List<String> lines = new ArrayList<>();

        if (text == null || text.isEmpty()) {
            return lines;
        }

        // Split by existing line breaks first
        String[] paragraphs = text.split("\n");

        for (String paragraph : paragraphs) {
            if (paragraph.trim().isEmpty()) {
                lines.add(""); // Preserve empty lines
                continue;
            }

            // Wrap long paragraphs
            String[] words = paragraph.split(" ");
            StringBuilder currentLine = new StringBuilder();

            for (String word : words) {
                String testLine = currentLine.length() == 0
                        ? word
                        : currentLine + " " + word;

                try {
                    float width = PDType1Font.HELVETICA.getStringWidth(testLine) / 1000 * FONT_SIZE;

                    if (width > maxWidth && currentLine.length() > 0) {
                        // Current line is full, start new line
                        lines.add(currentLine.toString());
                        currentLine = new StringBuilder(word);
                    } else {
                        // Add word to current line
                        currentLine = new StringBuilder(testLine);
                    }
                } catch (IOException e) {
                    // If we can't calculate width, just add the word
                    currentLine = new StringBuilder(testLine);
                }
            }

            // Add remaining line
            if (currentLine.length() > 0) {
                lines.add(currentLine.toString());
            }
        }

        return lines;
    }

    /**
     * Generate a simple PDF with custom styling for resumes.
     *
     * @param applicantId The applicant's ID
     * @param content Resume content
     * @return PDF file as byte array
     */
    public byte[] generateResumePdf(String applicantId, String content) {
        String title = "CURRICULUM VITAE - Applicant " + applicantId;
        return generatePdf(title, content);
    }

    /**
     * Generate a simple PDF for cover letters.
     *
     * @param applicantId The applicant's ID
     * @param content Cover letter content
     * @return PDF file as byte array
     */
    public byte[] generateCoverLetterPdf(String applicantId, String content) {
        String title = "COVER LETTER - Applicant " + applicantId;
        return generatePdf(title, content);
    }
}
