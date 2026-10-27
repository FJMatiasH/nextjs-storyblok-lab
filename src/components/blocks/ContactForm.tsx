import { storyblokEditable } from "@storyblok/react/rsc";

type ContactFormBlock = {
  _uid: string;
  _editable?: string;
  title?: string;
};

export default function ContactForm({ blok }: { blok: ContactFormBlock }) {
  return (
    <section className="contact-form" {...storyblokEditable(blok)}>
      {blok.title?.trim() && <h2>{blok.title}</h2>}
    </section>
  );
}
