
using System;
using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace ESEIM.Models
{
    [Table("RM_VAYXE_ACTIVITY_REQUEST_STATUS_DELIVERY")]
    public class RmVayxeActivityRequestStatusDelivery
    {
        [DatabaseGenerated(DatabaseGeneratedOption.Identity)]
        public int Id { get; set; }

        //public int Id_deliver { get; set; }

        [StringLength(maximumLength: 255)]
        public string RequestCode { get; set; }

        public int IsDisable { get; set; }

        public int IsDeleted { get; set; }

        public int Status { get; set; }

        public DateTime? CreatedDate { get; set; }

        public int? CreatedBy { get; set; }

        public DateTime? UpdatedDate { get; set; }

        public int? UpdatedBy { get; set; }
        
    }
}
