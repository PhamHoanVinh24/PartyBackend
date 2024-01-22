using System;
using System.Collections.Generic;
using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;
using System.Linq;
using System.Threading.Tasks;

namespace ESEIM.Models
{
    [Table("RM_VAYXE_BOOK_SERVICE_DETAILS")]
    public class RmVayxeBookServiceDetails
    {
        [DatabaseGenerated(DatabaseGeneratedOption.Identity)]
        public int Id { get; set; }
        public int? BookChkId { get; set; }
        public int? ServiceId { get; set; }
        public int? Status { get; set; }
        public DateTime CreatedTime { get; set; }
        public DateTime UpdatedTime { get; set; }
        public int? Flag { get; set; }
        [StringLength(maximumLength: 500)]
        public string Note { get; set; }
        [StringLength(maximumLength: 255)]
        public string CreatedBy { get; set; }
        [StringLength(maximumLength: 255)]
        public string UpdatedBy { get; set; }
    }
}
