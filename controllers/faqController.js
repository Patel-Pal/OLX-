let allFaqs = [];

    function renderFAQs(faqs) {
      const container = $('#faqAccordion');
      container.empty();

      if (faqs.length === 0) {
        container.html(`<p class="text-center text-muted">No matching FAQs found.</p>`);
        return;
      }

      faqs.forEach((faq, index) => {
        const item = `
         <div class="accordion-item mb-3 shadow-sm rounded border">
            <h2 class="accordion-header " id="heading${index}">
                <button class="accordion-button ${index !== 0 ? 'collapsed' : ''}" type="button"
                data-bs-toggle="collapse" data-bs-target="#collapse${index}"
                aria-expanded="${index === 0}" aria-controls="collapse${index}">
                ${faq.question}
                </button>
            </h2>
            <div id="collapse${index}" class="accordion-collapse  collapse ${index === 0 ? 'show' : ''}"
                aria-labelledby="heading${index}" data-bs-parent="#faqAccordion">
                <div class="accordion-body bg-light">
                ${faq.answer}
                </div>
            </div>
        </div>

        `;
        container.append(item);
      });
    }

    $(document).ready(function () {
      // Fetch FAQ data from JSON file
      $.getJSON('/data/faq.json', function (data) {
        allFaqs = data;
        renderFAQs(allFaqs);
      });

      $('#faqSearch').on('input', function () {
        const search = $(this).val().toLowerCase();
        const filtered = allFaqs.filter(faq =>
          faq.question.toLowerCase().includes(search) || faq.answer.toLowerCase().includes(search)
        );
        renderFAQs(filtered);
      });
    });