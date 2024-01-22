using Newtonsoft.Json;
using System;
using System.Collections.Generic;
using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;
using System.Text;

namespace ESEIM.Models
{
    [Table("WORK_SHIFT_CHECKIN_OUT")]
    public class WorkShiftCheckInOut
    {
        //public WorkShiftCheckInOut()
        //{
        //    ListStatus = new List<JsonLog>();
        //}

        [Key, DatabaseGenerated(DatabaseGeneratedOption.Identity)]
        public int Id { get; set; }

        [StringLength(255)]
        public string Action { get; set; }

        public DateTime ActionTime { get; set; }

        public DateTime? ActionTo { get; set; }

        public string Note { get; set; }
        public string Title { get; set; }

        [StringLength(255)]
        public string LocationGPS { get; set; }

        [StringLength(255)]
        public string LocationText { get; set; }

        [StringLength(50)]
        public string Device { get; set; }

        [StringLength(50)]
        public string UserId { get; set; }

        [StringLength(255)]
        public string Picture { get; set; }


        [StringLength(255)]
        public string Ip { get; set; }

        public int Session { get; set; }

        [StringLength(50)]
        public string CreatedBy { get; set; }

        public DateTime CreatedTime { get; set; }

        [StringLength(50)]
        public string UpdatedBy { get; set; }

        public DateTime? UpdatedTime { get; set; }
        public string DeletedBy { get; set; }
        public DateTime? DeletedTime { get; set; }

        public bool IsDeleted { get; set; }

        public string ShiftCode { get; set; }

        public bool Approve { get; set; }
        public string Approver { get; set; }
        public DateTime? ApproveTime { get; set; }
        public string NotWorkType { get; set; }
        public bool? WorkHoliday { get; set; }

        [NotMapped]
        public List<JsonLog> ListStatus { get; set; }

        public string Status { get; set; }
        public string StatusLog
        {
            get
            {
                return JsonConvert.SerializeObject(ListStatus);
            }
            set
            {
                ListStatus = string.IsNullOrEmpty(value)
                ? new List<JsonLog>()
                : JsonConvert.DeserializeObject<List<JsonLog>>(value);
            }
        }

        public string WorkflowCode { get; set; }
    }

    public class StaffTimeKeepingModel
    {
        public int? Id { get; set; }

        [Required]
        public string UserId { get; set; }

        [Required]
        public string Action { get; set; }

        [Required]
        public string ActionTime { get; set; }
        public string ActionTo { get; set; }
        public string NotWorkType { get; set; }
        [Required]
        public double Lat { get; set; }
        public double Lon { get; set; }
        public string LocationText { get; set; }
        public string Ip { get; set; }
        public string Note { get; set; }
        public string Title { get; set; }
        public bool? IsException { get; set; }
        public bool? WorkHoliday { get; set; }
        public string WorkflowCode { get; set; }
        public string CreatedBy { get; set; }
    }

    public class SStaffTimeKeepingModelcheck
    {
        public int? Id { get; set; }

        //[Required]
        public string UserId { get; set; }

        //[Required]
        public string Action { get; set; }

        //[Required]
        public string ActionTime { get; set; }
        public string ActionTo { get; set; }

        //[Required]
        public double Lat { get; set; }

        //[Required]
        public double Lon { get; set; }
        public string LocationText { get; set; }
        public string Ip { get; set; }
        public string Note { get; set; }
        public string ShiftCode { get; set; }
    }

    public class UserModelCheckIn
    {
        [Required]
        public string UserId { get; set; }

        [Required]
        public double Lat { get; set; }

        [Required]
        public double Lon { get; set; }
        public string Note { get; set; }
        public string Title { get; set; }
        public string ShiftCode { get; set; }
    }
}
