import passport from 'passport';
import { Strategy as GoogleStrategy } from 'passport-google-oauth20';
import { query } from '../db';

passport.use(
  new GoogleStrategy(
    {
      clientID: process.env.GOOGLE_CLIENT_ID!,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET!,
      callbackURL: '/api/auth/google/callback',
    },
    async (accessToken, refreshToken, profile, done) => {
      try {
        const email = profile.emails?.[0]?.value;
        const name = profile.displayName;
        const avatar = profile.photos?.[0]?.value;
        const googleId = profile.id;

        // Check if user exists
        let result = await query(
          'SELECT * FROM users WHERE google_id = $1',
          [googleId]
        );

        let user;
        if (result.rows.length === 0) {
          // Create new user
          result = await query(
            'INSERT INTO users (name, email, avatar, google_id) VALUES ($1, $2, $3, $4) RETURNING *',
            [name, email, avatar, googleId]
          );
          user = result.rows[0];
        } else {
          user = result.rows[0];
        }

        return done(null, user);
      } catch (error) {
        return done(error as Error);
      }
    }
  )
);

passport.serializeUser((user: any, done) => {
  done(null, user.id);
});

passport.deserializeUser(async (id: number, done) => {
  try {
    const result = await query('SELECT * FROM users WHERE id = $1', [id]);
    done(null, result.rows[0]);
  } catch (error) {
    done(error);
  }
});
