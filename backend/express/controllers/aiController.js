const axios = require('axios');

const FASTAPI_URL = process.env.FASTAPI_URL || 'http://localhost:8000';

exports.search = async (req, res) => {
    try {
        const { query, top_k } = req.body;

        if (!query) {
            return res.status(400).json({ message: 'Query is required' });
        }

        const response = await axios.post(`${FASTAPI_URL}/api/search`, {
            query,
            top_k
        });

        res.status(200).json(response.data);

    } catch (error) {
        console.error('FastAPI search error:', error.message);
        res.status(502).json({ message: 'AI service unavailable', error: error.message });
    }
};

exports.recommend = async (req, res) => {
    try {
        const { query, top_k } = req.body;

        if (!query) {
            return res.status(400).json({ message: 'Query is required' });
        }

        const response = await axios.post(`${FASTAPI_URL}/api/recommend`, {
            query,
            top_k
        });

        res.status(200).json(response.data);

    } catch (error) {
        console.error('FastAPI recommend error:', error.message);
        res.status(502).json({ message: 'AI service unavailable', error: error.message });
    }
};

exports.getExercise = async (req, res) => {
    try {
        const { id } = req.params;
        const response = await axios.get(`${FASTAPI_URL}/api/exercise/${id}`);
        res.status(200).json(response.data);
    } catch (error) {
        if (error.response && error.response.status === 404) {
            return res.status(404).json({ message: 'Exercise not found' });
        }
        console.error('FastAPI exercise error:', error.message);
        res.status(502).json({ message: 'AI service unavailable', error: error.message });
    }
};

exports.listExercises = async (req, res) => {
    try {
        const response = await axios.get(`${FASTAPI_URL}/api/exercises`, { params: req.query });
        res.status(200).json(response.data);
    } catch (error) {
        console.error('FastAPI list exercises error:', error.message);
        res.status(502).json({ message: 'AI service unavailable', error: error.message });
    }
};

exports.plan = async (req, res) => {
    try {
        const { query } = req.body;
        if (!query) return res.status(400).json({ message: 'Query is required' });

        const response = await axios.post(`${FASTAPI_URL}/api/plan`, { query });
        res.status(200).json(response.data);
    } catch (error) {
        console.error('FastAPI plan error:', error.message);
        res.status(502).json({ message: 'AI service unavailable', error: error.message });
    }
};