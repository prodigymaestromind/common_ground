// Where feedback answers get sent.
//
// SETUP (2 min): go to https://formspree.io → sign up free → "New form" →
// copy the form ID (looks like "xyzabcde") and paste it below.
// Answers then show up in your Formspree dashboard + your email.
//
// Until you add an ID, answers are saved on the tester's phone only.
export const FORMSPREE_ID = 'abcdwxyz'

export async function sendFeedback(answers) {
  const all = JSON.parse(localStorage.getItem('cg-feedback') || '[]')
  all.push(answers)
  localStorage.setItem('cg-feedback', JSON.stringify(all))
  if (!FORMSPREE_ID) return { ok: true, local: true }
  const res = await fetch(`https://formspree.io/f/${FORMSPREE_ID}`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', Accept: 'application/json' },
    body: JSON.stringify(answers),
  })
  return { ok: res.ok, local: false }
}
