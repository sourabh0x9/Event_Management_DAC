const express =  require('express');
const multer = require('multer');

const router = express.Router();
const pool = require('../db/mysqlpool');
const result = require('../utils/result');

const fs = require('fs'); 
const mime = require('mime-types');

//-----------------------------------GET-------------------------------------

router.get('/upcomingEvents',(request,response)=>{
    const sql =  ` select evt_title, description from events where Date(start_dateTime) > now() `;

    pool.query(sql , (error , data)=>{
        response.send(result.CreateResult(error,data));
    })
})

router.get('/pastEvents',(request,response)=>{
    const sql =  ` select evt_title, description from events where Date(start_dateTime) <= now() `;

    pool.query(sql , (error , data)=>{
        response.send(result.CreateResult(error,data));
    })
})

router.get('/eventDetails',(request,response)=>{
    const evt_id = request.headers;
    const sql =  ` select evt_title, description, start_dateTime, end_dateTime, location, remaining_capacity, ticket_price 
    from events where evt_id = ? `;

    pool.query(sql ,[evt_id] , (error , data)=>{
        response.send(result.CreateResult(error,data));
    })
})

// Show events OF ORGANIZER USING ORGANIZER ID
router.get('/organiserEvents',(request,response)=>{
    const org_id  = request.headers;
    const sql =` select evt_title, description, Date(start_dateTime) as start_dateTime, Date(end_dateTime) as end_dateTime,
    location, ticket_price from events e join organiser o on e.org_id = ? `;
    pool.query(sql ,[ org_id ], (error , data)=>{
        response.send(result.CreateResult(error,data));
    })
})

router.get('/organiserUpcomingEvents',(request,response)=>{
    const org_id  = request.headers;
    const sql =` select evt_title, description, Date(start_dateTime) as start_dateTime, Date(end_dateTime) as end_dateTime,
    location, ticket_price from events e join organiser o on e.org_id = ? where Date(start_dateTime) > now() `;
    pool.query(sql ,[ org_id ], (error , data)=>{
        response.send(result.CreateResult(error,data));
    })
})

router.get('/organiserEventsByDate',(request,response)=>{
    const org_id  = request.headers;

    const sql =` select evt_title, description, Date(start_dateTime) as start_dateTime, Date(end_dateTime) as end_dateTime,
    location, ticket_price from events e join organiser o on e.org_id = ? order by start_dateTime desc `;
    pool.query(sql ,[ org_id ], (error , data)=>{
        response.send(result.CreateResult(error,data));
    })
})

router.get('/organiserEventsByLocation',(request,response)=>{
    const org_id  = request.headers;
    const location = request.params;

    const sql =` select evt_title, description, Date(start_dateTime) as start_dateTime, Date(end_dateTime) as end_dateTime,
    location, ticket_price from events e join organiser o on e.org_id = ? where location = ? `;
    pool.query(sql ,[ org_id, location ], (error , data)=>{
        response.send(result.CreateResult(error,data));
    })
})

router.get('/organiserEventsByCategory',(request,response)=>{
    const org_id  = request.headers;
    const category = request.params;

    const sql =` select evt_title, description, Date(start_dateTime) as start_dateTime, Date(end_dateTime) as end_dateTime,
    location, ticket_price from events e join organiser o on e.org_id = ? where category = ? `;
    pool.query(sql ,[ org_id, category ], (error , data)=>{
        response.send(result.CreateResult(error,data));
    })
})

router.get('/organiserPastEvents',(request,response)=>{
    const org_id  = request.headers;
    const sql =` select evt_title, description, Date(start_dateTime) as start_dateTime, Date(end_dateTime) as end_dateTime,
    location, ticket_price from events e join organiser o on e.org_id = ? and Date(start_dateTime) < now() `;
    pool.query(sql ,[ org_id ], (error , data)=>{
        // console.log(" Printing Data : "+ data)
        response.send(result.CreateResult(error,data));
    })
})

router.get('/organisersEventDetail',(request,response)=>{
    const { org_id, evt_id } = request.headers;

    const sql =` select evt_title, description, Date(start_dateTime) as start_dateTime, Date(end_dateTime) as end_dateTime,
    location, ticket_price from events e join organiser o on e.org_id = ? and e.evt_id = ? `;
    pool.query(sql ,[ org_id, evt_id ], (error , data)=>{
        // console.log(" Printing Data : "+ data)
        response.send(result.CreateResult(error,data));
    })
})

// SHOW ALL EVENTS OF SPECIFIC CUSTOMER USING CUSTOMER ID
router.get('/bookedEvents',(request,response)=>{
    const cst_id = request.headers; // stored data in headers 

    const sql = `select evt_title, description, Date(start_dateTime) as start_dateTime, Date(end_dateTime) as end_dateTime,
    location, ticket_price from events e join booking b on e.evt_id = b.evt_id join customers c on b.cst_id = ? `
    
    pool.query(sql , [cst_id],(error , data)=>{
        response.send(result.CreateResult(error,data));
    })
})

// SHOW EVENTS AT SPECIFIC DATE ???? PROBLEM DATE TIME ....
router.get('/bookedEventsByDate',(request,response)=>{
    const cst_id = request.headers;

    const sql = ` select e.evt_title, e.description, DATE(e.start_dateTime) AS start_date, DATE(e.end_dateTime) AS end_date, 
    e.location, e.ticket_price FROM events e JOIN booking b ON e.evt_id = b.evt_id JOIN customers c ON b.cst_id = ? 
    order by start_dateTime desc `;

    pool.query(sql,[cst_id ], (error , data)=>{
        response.send(result.CreateResult(error,data));
  })
});

//  Filter by Venue : LOCATION
router.get('/bookedEventsByLocation',(request,response)=>{
    const location = request.params;
    const cst_id = request.headers;

    const sql = ` select e.evt_title, e.description, DATE(e.start_dateTime) AS start_date, DATE(e.end_dateTime) AS end_date, 
    e.location, e.ticket_price FROM events e JOIN booking b ON e.evt_id = b.evt_id JOIN customers c ON b.cst_id = ?
    where location = ? `;

    pool.query(sql,[ cst_id, location ], (error , data)=>{
        response.send(result.CreateResult(error,data));
    })
})

// Filter by Category : ctg_id
router.get('/bookedEventsByCategory',(request,response)=>{
    const  ctg_id = request.params;
    const cst_id = request.headers;

    const sql = ` select e.evt_title, e.description, DATE(e.start_dateTime) AS start_date, DATE(e.end_dateTime) AS end_date, 
    e.location, e.ticket_price FROM events e JOIN booking b ON e.evt_id = b.evt_id JOIN customers c ON b.cst_id = ?
    where ctg_id = ? `;

    pool.query(sql ,[cst_id, ctg_id], (error , data)=>{
        response.send(result.CreateResult(error,data));
    })
})


//---------------------------------------------------------------

// Image get GET : multor   !!!!!!!!!!!!!!!!!!!!!!!!!!!pending 
router.get('/getImage', (req , res)=> {
    
})


// -------------------------------------------------------------------------------------------
const IMAGE_DIR = process.env.IMAGE_DIR || path.join(__dirname, '..', 'images');

router.get('/getImage/:evt_id', async (req, res) => {
  const { evt_id } = req.params;
  const sql = `SELECT evt_image FROM EVENTS WHERE evt_id = ? AND is_deleted = FALSE`;

  try {
    const [rows] = await pool.promise().query(sql, [evt_id]);
    if (!rows.length || !rows[0].evt_image) {
      return res.status(404).send(CreateResult(null, { message: 'Image not found' }));
    }

    const filename = path.basename(rows[0].evt_image);
    if (!filename.match(/^[a-zA-Z0-9_.-]+$/)) {
      return res.status(400).send(CreateResult(null, { message: 'Invalid image filename' }));
    }

    const imagePath = path.join(IMAGE_DIR, filename);
    await fs.access(imagePath, fs.constants.F_OK);

    const mimeType = mime.lookup(filename) || 'application/octet-stream';
    res.set('Content-Type', mimeType);
    res.sendFile(imagePath);
  } catch (error) {
    if (error.code === 'ENOENT') {
      return res.status(404).send(CreateResult(null, { message: 'Image file not found on server' }));
    }
    res.send(CreateResult(error, null));
  }
});




// Add Event Image GET 
router.post('/addImage',(req,res)=> {

})


//-------------------------------------------------------------POST-----------------------------------------------------------
//  POST

// add Event
router.post( '/addEvent' ,(request,response)=> {
 
  const org_id = request.headers;

  const {
    evt_title,
    description,
    start_dateTime,
    end_dateTime,
    location,
    capacity,
    ticket_price,
    ctg_id
    } = request.body;


    const sql = ` INSERT INTO events (
  evt_title, description, start_dateTime, end_dateTime,
  location, capacity, ticket_price, org_id, ctg_id )
   VALUES ( ?,?,?,?,?,?,?, ?, ? ) `

   pool.query( sql , [ evt_title, description, start_dateTime, end_dateTime, location, capacity, ticket_price, org_id, ctg_id ] ,
    ( error , data ) => {
        response.send(result.CreateResult(error, data));
   })

})


//-------------------------DELETE------------------------------------

// router.delete( '/delete' , (request,response) => {
//     const { evt_id } = request.headers;
//     const sql = ` DELETE FROM EVENT WHERE evt_id = ? `;
   
//     pool.query( sql , [evt_id] , ( error , result )=> {
     
//     if( error)  { return response.status(500).json({ message: " Database Error "}); } 
//     if( result.affectedRows > 0 ){
//         return response.status(200).json({ success : true , message : " Event Deleted successfully"})
//     } 
//     else {
//          return response.status(404).json({ success: false, message: 'Event not found' });
//     }
       
//     })

// })

/*
delete this inserted data :
-- Event for Health & Wellness
INSERT INTO events (
    evt_title,   description, start_dateTime, end_dateTime,
    location, capacity, remaining_capacity,ticket_price,
    fst_id, org_id,ctg_id,created_by
) VALUES ( 'Wellness Retreat 2025','A rejuvenating retreat focusing on holistic health practices.',
    '2025-08-10 09:00:00','2025-08-12 17:00:00','Serenity Resort, Pune',
    100, 100,1500.00, 1, 2, 3, 'admin'
);
*/

router.delete('/delete', (request, response) => {
  const { evt_id } = request.headers;

  const sql = 'DELETE FROM events WHERE evt_id = ?';

  pool.query(sql, [evt_id], (error, result) => {
    
    if (result.affectedRows > 0) {
      return response.status(200).json({ success: true, message: 'Event deleted successfully' });
    } else {
      return response.status(404).json({ success: false, message: 'Event not found' });
    }
  });
})



module.exports = router;