using System;
using System.Collections.Generic;
using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;
using System.Linq;
using System.Threading.Tasks;

namespace ESEIM.Models
{
    [Table("RM_VAYXE_BOOK_CHECKING")]
    public class RmVayxeBookChecking
    {
        [DatabaseGenerated(DatabaseGeneratedOption.Identity)]
        public int Id { get; set; }
        public int? NumChk { get; set; }
        [StringLength(maximumLength: 250)]
        public string TitleChk { get; set; }
        [StringLength(maximumLength: 250)]
        public string Note { get; set; }
        public DateTime? NextChkTime { get; set; }
        public int? Status { get; set; }
        public DateTime? CreatedTime { get; set; }
        public DateTime? UpdatedTime { get; set; }
        public int? ClientId { get; set; }
        [StringLength(maximumLength: 250)]
        public string LicensePlate { get; set; }
        public int? ApproverId { get; set; }
        [StringLength(maximumLength: 250)]
        public string BookChkCode { get; set; }
        public int? BlockId { get; set; }
        [StringLength(maximumLength: 250)]
        public string CreatedBy { get; set; }
        [StringLength(maximumLength: 250)]
        public string UpdatedBy { get; set; }
        public bool? IsDeleted { get; set; }
        [StringLength(maximumLength: 250)]
        public string VendorCode { get; set; }
    }
}
