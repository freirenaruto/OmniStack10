import Dev from '../model/Dev';
import axios from '../services/index';
import parseStringAsArray from '../utils/parseStringAsArray';

class DevsController {
    async index(req, res) {
        const devs = await Dev.find();

        return res.json(devs);
    }

    async store(req, res) {
        const { github_username, techs, latitude, longitude } = req.body;

        let dev = await Dev.findOne({ github_username });

        if (dev) {
            return res.status(401).json({ error: 'User alredy exists' });
        }

        const response = await axios
            .get(`/users/${github_username}`)
            .catch(err => {
                return res.status(401).json({ error: err.response.statusText });
            });

        const { name = 'login', avatar_url, bio } = response.data;

        const techsArray = parseStringAsArray(techs);

        const location = {
            type: 'Point',
            coordinates: [longitude, latitude],
        };

        dev = await Dev.create({
            github_username,
            name,
            avatar_url,
            bio,
            techs: techsArray,
            location,
        });

        return res.json(dev);
    }
}

export default new DevsController();
