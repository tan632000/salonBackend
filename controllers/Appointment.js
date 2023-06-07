const { default: mongoose } = require('mongoose');
const Appointment = require('../models/Appointment.js');
const RegisteredSalon = require('../models/RegisteredSalon.js');
const Stylist = require('../models/Stylist.js');

// Get all appointments by userId
async function getAppointmentsByUserId(req, res) {
  try {
    const appointments = await Appointment.find({userId: req.params.userId})
      .populate('user', 'firstName lastName photo')
      .populate('stylist', '_id name')
      .populate('service', 'name price')
      .populate('salonId', '_id name address');

    if (!appointments) {
      return res.status(404).json({ message: 'Appointment not found' });
    }
    const historyCut = await Promise.all(appointments.map(async appointment => {
      return {
        id: appointment._id,
        serviceName: appointment.service.name,
        stylistName: appointment.stylist.name,
        money: appointment.service.price,
        address: appointment.salonId.address,
        time: appointment.time,
        status: appointment.status,
        salonId: appointment.salonId._id,
        salonName: appointment.salonId.name,
        stylistId: appointment.stylist._id
      };
    }))
    res.json(historyCut);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
}

// Get all appointments by time and salon ID
async function getAppointmentsByTimeAndSalon(req, res) {
  try {
    // Extract parameters from request URL
    const salonId = req.params.salonId;
    const year = req.params.year;
    const month = req.params.month;
    const day = req.params.day;

    let filteredAppointments;
    // Format date string in YYYY-MM-DD format
    const dateString = `${year}-${month.padStart(2, '0')}-${day.padStart(2, '0')}`;

    // Filter appointments by date and salon ID
    if (salonId === 'All' || salonId === null || salonId === undefined) {
      filteredAppointments = await Appointment.find({
        time: { $regex: new RegExp(`^${dateString}`) }
      }).populate({path: 'user', select: 'firstName lastName'})
      .populate({path: 'stylist', select: 'name photo'})
      .populate({path: 'service', select: 'price'});
    } else {
      filteredAppointments = await Appointment.find({
        salonId: salonId,
        time: { $regex: new RegExp(`^${dateString}`) }
      }).populate({path: 'user', select: 'firstName lastName'})
      .populate({path: 'stylist', select: 'name photo'})
      .populate({path: 'service', select: 'price'});
    }
    const result = await Promise.all(filteredAppointments.map(async appointment => {
      return {
        _id: appointment._id,
        salonId: appointment.salonId,
        stylistId: appointment.stylistId,
        serviceId: appointment.serviceId,
        userId: appointment.userId,
        time: appointment.time,
        note: appointment.note,
        duration: appointment.duration,
        status: appointment.status,
        userName: appointment.user.firstName + " " + appointment.user.lastName,
        stylist: {
          name: appointment.stylist.name,
          photo: appointment.stylist.photo
        },
        price: appointment.service.price
      };
    }))
    res.send(result);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Internal server error' });
  }
}

// Create a new appointment
async function createAppointment(req, res) {
  const { salonId, stylistId, serviceId, userId, time, note, duration } = req.body;
  const updatedTime = time.substring(0, 19);
  const appointmentStartTime = new Date(updatedTime);
  const appointmentEndTime = new Date(appointmentStartTime.getTime() + duration * 60 * 60 * 1000);

  // Check if the appointment time is within the range of 8am to 6pm
  const appointmentHour = appointmentStartTime.getHours();
  if (appointmentHour < 8 || appointmentHour >= 18) {
    return res.status(400).json({
      error: "Vui lòng đặt lịch trong khoảng thời gian từ 8 đến 18 giờ. Mời bạn chọn lại thời gian.",
    });
  }

  try {
    // Check if there are any overlapping appointments for the stylist
    const existingAppointment = await Appointment.findOne({
      stylistId,
      $or: [
        {
          time: { $lte: appointmentEndTime },
          $and: [
            { time: { $gte: updatedTime } },
            { time: { $lt: appointmentStartTime } },
          ],
        },
        {
          time: { $gte: updatedTime },
          $and: [
            { time: { $lt: appointmentEndTime } },
            { time: { $gt: appointmentStartTime } },
          ],
        },
      ],
    });

    if (existingAppointment) {
      // The stylist is not available during the requested time
      return res.status(400).json({
        error: "Stylist chưa hoàn thành dịch vụ vào khoảng thời gian này. Vui lòng cập nhật lại thời gian.",
      });
    }

    // Create a new appointment
    const appointment = new Appointment({
      salonId,
      stylistId,
      serviceId,
      userId,
      time: updatedTime,
      note,
      duration,
      status: 1,
    });

    await appointment.save();
    await Stylist.updateOne({ isBusy: true });

    return res.status(201).json({
      appointment,
    });
  } catch (error) {
    console.error(error);
    throw error;
  }
}

// Get all appointments
async function getAppointments(req, res) {
  try {
    const salonId = req.params.salonId;
    const appointments = (salonId === 'All' || salonId === null || salonId === undefined) ?
      await Appointment.find()
      :
      await Appointment.find({ salonId:salonId });
    res.send(appointments);
  } catch (error) {
    console.error(error);
    throw error;
  }
}

// Get appointment per time select
async function getAppointmentPerTimeSelect(req, res) {
  try {
    const salonId = req.params.salonId;
    const today = new Date();
    const startTime = new Date(today.getFullYear(), today.getMonth(), today.getDate(), 7); // Start time for time slots (7AM)
    const endTime = new Date(today.getFullYear(), today.getMonth(), today.getDate(), 21); // End time for time slots (9PM)
    const numTimeSlots = (endTime - startTime) / (60 * 60 * 1000); // Number of time slots (1 hour each)
    const appointments = (salonId === 'All' || salonId === null || salonId === undefined) ? 
      await Appointment.find() 
      : 
      await Appointment.find({ salonId: salonId });
    const appointmentsPerHour = Array(numTimeSlots).fill(0); // Initialize array with zeros
    appointments.forEach((appointment) => {
      const time = new Date(appointment.time);
      const hour = time.getHours();
      if (hour >= 7 && hour < 21) { // Only count hours between 7AM and 9PM
        const index = hour - 7; // Index of array corresponding to hour
        appointmentsPerHour[index]++;
      }
    });
    const data = [["Time", "Number of Appointments"]];
    for (let i = 0; i < numTimeSlots; i++) {
      const hour = i + 7;
      data.push([hour + ":00", appointmentsPerHour[i]]);
    }
    res.json(data);
  } catch (err) {
    console.error(err);
    res.status(500).send('Server Error');
  }
}

async function getTotalRevenue(req, res) {
  try {
    const salonId = req.params.salonId;

    // Find all appointments for the salon
    const appointments = (salonId === 'All' || salonId === null || salonId === undefined || salonId === "null") ? 
      await Appointment.find().populate('service') 
      : 
      await Appointment.find({ salonId: salonId, status: 2 }).populate('service');

    // Calculate the total revenue based on the prices of the services in each appointment
    let totalRevenue = appointments.reduce((total, appointment) => {
      return total + appointment.service.price;
    }, 0);
    const listVerifySalon = await RegisteredSalon.find({verified: true});
    totalRevenue += 1000000 * listVerifySalon.length
    res.send({ totalRevenue });
  } catch (error) {
    console.error(error);
    res.status(500).send('Server Error');
  }
}

async function updateAppointment(req, res) {
  try {
    const status = parseInt(req.params.status); // Parse the string to an integer

    const appointment = await Appointment.findByIdAndUpdate(
      { _id: req.params.id },
      { status },
      { new: true }
    );

    const stylist = await Stylist.findByIdAndUpdate(
      { _id: appointment.stylistId },
      { isBusy: status === 1 ? true : false },
      { new: true }
    );

    res.send({
      message: 'Success update',
      appointment,
      stylist
    });
  } catch (error) {
    console.error(error);
    res.status(500).send('Server Error');
  }
}

async function getTopServices(req, res) {
  try {
    const { salonId } = req.params;
    const pipeline = [
      {
        $match: {
          salonId: salonId !== 'All' ? new mongoose.Types.ObjectId(salonId) : { $exists: true } // match on salonId only if it exists
        }
      },
      {
        $group: {
          _id: { serviceId: "$serviceId", salonId: salonId !== 'All' ? "$salonId" : null },
          count: { $sum: 1 }
        }
      },
      {
        $lookup: {
          from: "services",
          localField: "_id.serviceId",
          foreignField: "_id",
          as: "service"
        }
      },
      {
        $unwind: "$service"
      },
      {
        $addFields: {
          serviceName: "$service.name",
          salonId: {
            $cond: {
              if: { $eq: [ "$_id.salonId", null ] },
              then: "$service.salonId",
              else: "$_id.salonId"
            }
          }
        }
      },
      {
        $lookup: {
          from: "salons",
          localField: "salonId",
          foreignField: "_id",
          as: "salon"
        }
      },
      {
        $unwind: "$salon"
      },
      {
        $addFields: {
          salonName: "$salon.name"
        }
      },
      {
        $project: {
          _id: 0,
          serviceId: "$_id.serviceId",
          count: 1,
          serviceName: 1,
          salonId: 1,
          salonName: 1
        }
      },
      {
        $sort: {
          count: -1
        }
      },
      {
        $limit: 10
      }
    ];
    const result = await Appointment.aggregate(pipeline);
    res.json(result);
  } catch (err) {
    console.error(err);
    res.status(500).send('Server Error');
  }
}

async function getStatisticByAge(req, res) {
  try {
    const { salonId } = req.params;
    
    const pipeline = [
      {
        $lookup: {
          from: "users",
          localField: "userId",
          foreignField: "_id",
          as: "user"
        }
      },
      {
        $unwind: "$user"
      },
      {
        $match: {
          "user.age": { $exists: true, $ne: null },
          salonId: salonId !== 'All' ? new mongoose.Types.ObjectId(salonId) : { $exists: true } // match on salonId only if it exists
        }
      },
      {
        $lookup: {
          from: "salons",
          localField: "salonId",
          foreignField: "_id",
          as: "salon"
        }
      },
      {
        $unwind: "$salon"
      },
      {
        $group: {
          _id: { age: "$user.age", salonName: "$salon.name", salonId: "$salon._id" },
          users: { $addToSet: "$userId" }
        }
      },
      {
        $project: {
          _id: "$_id.salonId",
          age: "$_id.age",
          count: { $size: "$users" },
          salonName: "$_id.salonName" // include salonName for now
        }
      },
      {
        $group: {
          _id: "$age",
          count: { $sum: "$count" },
          salonNames: { $addToSet: "$salonName" } // gather salon names for each age
        }
      },
      {
        $project: {
          _id: 0,
          age: "$_id",
          count: "$count",
          salonNames: 1
        }
      },
      {
        $sort: { age: 1 }
      },
      {
        $project: {
          age: 1,
          count: 1,
          salonNames: { $cond: { if: { $eq: [ { $size: "$salonNames" }, 1 ] }, then: { $arrayElemAt: [ "$salonNames", 0 ] }, else: "Multiple" } }
        }
      }
    ];
    
    const result = await Appointment.aggregate(pipeline);
    res.json(result);
  } catch (err) {
    console.error(err);
    res.status(500).send('Server Error');
  }
}

async function getStatisticByCity(req, res) {
  try {
    const appointmentsByCity = await Appointment.aggregate([
      {
        $match: {
          salonId: { $exists: true } // match on salonId only if it exists
        }
      },
      {
        $lookup: {
          from: 'salons',
          localField: 'salonId',
          foreignField: '_id',
          as: 'salon'
        }
      },
      {
        $unwind: '$salon'
      },
      {
        $group: {
          _id: '$salon.city',
          count: { $sum: 1 }
        }
      }
    ]);
    res.status(200).json(appointmentsByCity);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
}

async function updateTimeAppointment(req, res) {
  try {
    const {id} = req.params; // Parse the string to an integer
    const appointments = await Appointment.find(
      { _id: id }
    );
    const appointment = appointments[0];
    if (appointment.status !== 1) {
      return res.send({
        message: 'Bạn đã hoàn thành dịch vụ này. Mời bạn đăt lịch khác',
      });
    }
    const now = Date.now();
    const updatedTime = new Date(req.body.time).getTime();

    if (updatedTime < now) {
      return res.send({
        message: 'Thời gian cập nhật phải lớn hơn thời gian hiện tại.',
      });
    }

    appointment.time = req.body.time;
    await appointment.save();
    return res.send({
      appointment,
      message: 'Cập nhật thời gian đặt lịch thành công.',
    });
  } catch (error) {
    console.error(error);
    res.status(500).send('Server Error');
  }
}


module.exports = {
  getAppointmentsByTimeAndSalon,
  createAppointment,
  getAppointments,
  getAppointmentPerTimeSelect,
  getAppointmentsByUserId,
  getTotalRevenue,
  updateAppointment,
  getTopServices,
  getStatisticByAge,
  getStatisticByCity,
  updateTimeAppointment
};
