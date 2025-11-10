import { Inngest } from 'inngest';
import { connectDB } from './db.js';
import { User } from '../models/User.model.js';

export const inngest = new Inngest({ id: 'slack-clone' });

const syncUser = inngest.createFunction(
  { id: 'sync-user-function', name: 'sync-user' },
  { event: 'clerk/user.created' },
  async ({ event }) => {
    await connectDB();
    const { image_url, id, first_name, last_name, email_addresses } =
      event.data;

    const newUser = {
      clerksId: id,
      image: image_url,
      name: `${first_name || ''} ${last_name || ''}`,
      email: email_addresses[0]?.email_address,
    };

    await User.create(newUser);
  }
);

const deleteUsersFromDB = inngest.createFunction(
  { id: 'delete-user-function', name: 'delete-user-from-db' },
  { event: 'clerk/user.deleted' },
  async ({ event }) => {
    const { id } = event.data;
    await User.deleteOne({ clerksId: id });
  }
);

export const functions = [syncUser, deleteUsersFromDB];
