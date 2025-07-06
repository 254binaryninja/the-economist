import Brevo from '@getbrevo/brevo';

export async function subscribeToNewsletter(email: string, firstName?: string, lastName?: string, listIds?: number[]) {
  const contactsApi = new Brevo.ContactsApi();
  contactsApi.setApiKey(Brevo.ContactsApiApiKeys.apiKey, process.env.BREVO_API_KEY!);

  const payload: any = {
    email,
    updateEnabled: true,
    attributes: {}
  };
  if (firstName) payload.attributes.FNAME = firstName;
  if (lastName) payload.attributes.LNAME = lastName;
  if (listIds) payload.listIds = listIds;

  try {
    const response = await contactsApi.createContact(payload);
    return { success: true, message: `Contact ${response} added/updated` };
  } catch (err: any) {
    console.error('Brevo createContact error', err);
    const msg = err.response?.body?.message ?? err.message;
    throw new Error(msg);
  }
}