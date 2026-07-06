import passport from 'passport';
import { Strategy as LocalStrategy } from 'passport-local';
import { Strategy as GoogleStrategy } from 'passport-google-oauth20';
import { Strategy as GitHubStrategy } from 'passport-github2';
import User from '@/modules/auth/auth.model';
import { env } from '@/configs/env.config';

export function configurePassport() {
  passport.use(
    new LocalStrategy(
      { usernameField: 'email' },
      async (email, password, done) => {
        try {
          const user = await User.findOne({ email }).select('+password');
          if (!user || !user.password) {
            return done(null, false, { message: 'Invalid email or password' });
          }
          const isMatch = await user.comparePassword(password);
          console.log({
            isMatch
          })
          if (!isMatch) {
            return done(null, false, { message: 'Invalid email or password' });
          }
          console.log({
            user
          })
          return done(null, user);
        } catch (error) {
          return done(error);
        }
      }
    )
  );

  if (env.GOOGLE_CLIENT_ID && env.GOOGLE_CLIENT_SECRET) {
    passport.use(
      new GoogleStrategy(
        {
          clientID: env.GOOGLE_CLIENT_ID,
          clientSecret: env.GOOGLE_CLIENT_SECRET,
          callbackURL: '/api/auth/google/callback',
        },
        async (_accessToken, _refreshToken, profile, done) => {
          try {
            let user = await User.findOne({ provider: 'google', providerId: profile.id });
            if (!user) {
              user = await User.create({
                email: profile.emails?.[0]?.value,
                name: profile.displayName,
                avatar: profile.photos?.[0]?.value,
                provider: 'google',
                providerId: profile.id,
              });
            }
            return done(null, user);
          } catch (error) {
            return done(error as Error);
          }
        }
      )
    );
  }

  if (env.GITHUB_CLIENT_ID && env.GITHUB_CLIENT_SECRET) {
    passport.use(
      new GitHubStrategy(
        {
          clientID: env.GITHUB_CLIENT_ID,
          clientSecret: env.GITHUB_CLIENT_SECRET,
          callbackURL: '/api/auth/github/callback',
        },
        async (_accessToken: string, _refreshToken: string, profile: any, done: any) => {
          try {
            let user = await User.findOne({ provider: 'github', providerId: profile.id });
            if (!user) {
              user = await User.create({
                email: profile.emails?.[0]?.value || `${profile.username}@github.local`,
                name: profile.displayName || profile.username,
                avatar: profile.photos?.[0]?.value,
                provider: 'github',
                providerId: profile.id,
              });
            }
            return done(null, user);
          } catch (error) {
            return done(error as Error);
          }
        }
      )
    );
  }
}
