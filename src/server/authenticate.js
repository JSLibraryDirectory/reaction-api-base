import passport from 'passport';
import { Strategy, ExtractJwt } from 'passport-jwt';
import jwt from 'jwt-simple';
import { ObjectId } from 'mongodb';
import nodeify from 'nodeify';
import bcrypt from 'bcrypt';

const KEY = '0.7493999414687578';

async function userFromPayload(request, jwtPayload) {
  if (!jwtPayload.userId) {
    throw new Error('No userId in JWT');
  }
  return await request.context.Users.findOneById(ObjectId(jwtPayload.userId));
}

passport.use(new Strategy({
  jwtFromRequest: ExtractJwt.fromAuthHeader(),
  secretOrKey: KEY,
  passReqToCallback: true
}, (request, jwtPayload, done) => {
  nodeify(userFromPayload(request, jwtPayload), done);
}));

export default function authenticate(app) {
  app.use(passport.initialize());

  app.post('/login', async (req, res, next) => {
    try {
      const { email, password } = req.body;

      if (!email || !password) {
        throw new Error('Username or password not set on request');
      }

      const user = await req.context.Users.collection.findOne({ email });

      if (!user || !(await bcrypt.compare(password, user.hash))) {
        throw new Error('User not found matching email/password combination');
      }

      const payload = { userId: user._id.toString() };
      const token = jwt.encode(payload, KEY);

      res.json({ token });
    } catch (e) {
      next(e);
    }
  });
}
