import * as Yup from 'yup';
import Dev from '../model/Dev';
import axios from '../services/index';
import parseStringAsArray from '../utils/parseStringAsArray';

class DevsController {
    async index(req, res) {
        const devs = await Dev.find();
        return res.json(devs);
    }

    async store(req, res) {
        const schema = Yup.object().shape({
            github_username: Yup.string().required(),
            latitude: Yup.number().required(),
            longitude: Yup.number().required(),
            techs: Yup.string(),
        });

        if (!(await schema.isValid(req.body))) {
            return res.status(400).json({ error: `Validation fails` });
        }

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

    async update(req, res) {
        const schema = Yup.object().shape({
            github_username: Yup.string().required(),
            name: Yup.string(),
            avatar_url: Yup.string(),
            bio: Yup.string(),
            latitude: Yup.number(),
            longitude: Yup.number(),
        });

        if (
            !(await schema.isValid({
                github_username: req.params.github_username,
                name: req.body.name,
                avatar_url: req.body.avatar_url,
                bio: req.body.bio,
                latitude: req.body.latitude,
                longitude: req.body.longitude,
            }))
        ) {
            return res.status(400).json({ error: `Validation fails` });
        }
        if (req.body.github_username) {
            return res
                .status(401)
                .json({ error: 'Does not possible modify the username' });
        }

        const { github_username } = req.params;

        let dev = await Dev.findOne({ github_username });
        if (!dev) {
            return res.status(401).json({ error: 'User does not exits' });
        }

        if (req.body.latitude || req.body.longitude) {
            req.body.location = {
                type: 'Point',
                coordinates: [
                    req.body.longitude
                        ? req.body.longitude
                        : dev.location.coordinates[0],
                    req.body.latitude
                        ? req.body.latitude
                        : dev.location.coordinates[1],
                ],
            };
        }

        if (req.body.techs) {
            const { techs } = req.body;
            const techsArray = parseStringAsArray(techs);
            req.body.techs = techsArray;
        }

        await dev.updateOne(req.body);
        dev = await Dev.findOne({ github_username });

        return res.json(dev);
    }

    async delete(req, res) {
        const schema = Yup.object().shape({
            github_username: Yup.string().required(),
        });

        if (!(await schema.isValid(req.params))) {
            return res.status(400).json({ error: `Validation fails` });
        }

        const { github_username } = req.params;

        const teste = await Dev.deleteOne({ github_username });

        return res.json({
            mensage:
                teste.deletedCount === 1
                    ? `Usuario ${github_username} deletado com sucesso`
                    : `Não foi possivel deletar usuario ${github_username}`,
        });
    }
}

export default new DevsController();
