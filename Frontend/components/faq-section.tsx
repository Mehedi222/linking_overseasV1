import { Accordion, AccordionItem, AccordionTrigger, AccordionContent } from '@/components/ui/accordion'
import { FAQS } from '@/lib/constants'

export function FaqSection() {
  return (
    <section className="mx-auto max-w-3xl px-4 py-16">
      <div className="text-center">
        <h2 className="text-2xl font-bold tracking-tight">FAQ</h2>
        <p className="mt-2 text-sm text-muted-foreground">
          Quick answers for employers planning workforce recruitment from Bangladesh
        </p>
      </div>
      <Accordion className="mt-8">
        {FAQS.map((faq, i) => (
          <AccordionItem key={i} value={`faq-${i}`}>
            <AccordionTrigger>{faq.question}</AccordionTrigger>
            <AccordionContent>{faq.answer}</AccordionContent>
          </AccordionItem>
        ))}
      </Accordion>
    </section>
  )
}
