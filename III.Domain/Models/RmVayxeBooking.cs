
using System;
using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace ESEIM.Models
{
    [Table("RM_VAYXE_BOOK_CHECKING")]
    public class RmVayxeBooking
    {
        [DatabaseGenerated(DatabaseGeneratedOption.Identity)]
        public int Id { get; set; }

        public int UserId { get; set; }

        public int DriverId { get; set; }

        public int JourneyId { get; set; }

        public int NumberPeople { get; set; }//số chỗ ngồi muốn đặt

        public int IsBookingNow { get; set; }//0: đặt chuyến trước, 1: đặt chuyến luôn

        [StringLength(maximumLength: 50)]
        public string StartPoint { get; set; }

        [StringLength(maximumLength: 250)]
        public string StartName { get; set; }

        [StringLength(maximumLength: 50)]
        public string EndPoint { get; set; }

        [StringLength(maximumLength: 250)]
        public string End_name { get; set; }

        [StringLength(maximumLength: 255)]
        public string ReasonCancel { get; set; }

        public double Distance { get; set; }

        public double Cost { get; set; }

        public double FeeOfDriver { get; set; }

        public string Polyline { get; set; }

        public int TaxyType { get; set; }

        public DateTime TimeBookingTrip { get; set; }

        public DateTime TimePickup { get; set; }

        public DateTime TimeStart { get; set; }

        public DateTime TimeEnd { get; set; }

        public int Status { get; set; }

        public DateTime? CreatedDate { get; set; }

        public int? CreatedBy { get; set; }

        public DateTime? UpdatedDate { get; set; }

        public int? UpdatedBy { get; set; }

        [StringLength(maximumLength: 25)]
        public string Room { get; set; }
    }
}
