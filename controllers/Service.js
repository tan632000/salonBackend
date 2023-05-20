const Service = require('../models/Service.js');

// Create a new service
async function createService(req, res) {
  const { salonId, name, description, price, duration, images } = req.body;

  const service = new Service({
    salonId,
    name,
    description,
    price,
    duration,
    images
  });

  try {
    await service.save();
    return res.status(201).json({
      service
    });
  } catch (error) {
    console.error(error);
    throw error;
  }
};

// Get all services
async function getAllServices(req, res) {
  try {
    const services = await Service.find({});
    return res.status(200).json({
      services
    });
  } catch (error) {
    console.error(error);
     res.status(500).json({ error: 'Internal server error' });
  }
};

// Get count all services
async function getTotalServices(req, res) {
  try {
    const count = await Service.countDocuments({});
    res.status(200).json({ count });
  } catch (error) {
    console.error(error);
     res.status(500).json({ error: 'Internal server error' });
  }
};

// Get service by ID
async function getServiceBySalonId(req, res) {
  try {
    let salonId = req.params.salonId;
    let service;
    service = salonId === 'All' ? await Service.find() : await Service.find({ salonId:salonId })
    if (!service) {
      return res.status(404).json({ error: 'Service not found' });
    }
    res.status(200).json(service);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Internal server error' });
  }
};

// Update service
async function updateService(req, res) {
  try {
    const { name, description, price, duration, images } = req.body;
    const { salonId } = req.params;

    const service = await Service.findById(salonId);
    if (!service) {
      return res.status(404).json({ error: 'Service not found' });
    }
    if (images.length > 1) {
      service.images = images;
    } else {
      service.images[0] = images[0];
    }
    service.name = name;
    service.description = description;
    service.price = price;
    service.duration = duration;

    await service.save();

    return res.status(200).json({ service });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ error: 'Internal server error' });
  }
}

// Delete service
async function deleteService(req, res) {
  try {
    const service = await Service.findByIdAndRemove(req.params.id);
    if (!service) {
      return res.status(404).json({ error: 'Service not found' });
    }
    return res.status(200).json({
      message: 'Service deleted successfully'
    })
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Internal server error' });
  }
};


module.exports = {
  getAllServices,
  getTotalServices,
  getServiceBySalonId,
  createService,
  updateService,
  deleteService
};
