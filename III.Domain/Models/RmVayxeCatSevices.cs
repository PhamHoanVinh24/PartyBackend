using System;
using System.Collections.Generic;
using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;
using System.Linq;
using System.Threading.Tasks;

namespace ESEIM.Models
{
    [Table("RM_VAYXE_CAT_SEVICES")]
    public class RmVayxeCatSevices
    {
        [DatabaseGenerated(DatabaseGeneratedOption.Identity)]
        public int Id { get; set; }
        [StringLength(maximumLength: 100)]
        public string ServiceCode { get; set; }
        [StringLength(maximumLength: 250)]
        public string ServiceName { get; set; }
        [StringLength(maximumLength: 50)]
        public string ServiceGroup_id { get; set; }
        public DateTime? CreatedTime { get; set; }
        public DateTime? UpdatedTime { get; set; }
        public string ServiceTypeId { get; set; }
        [StringLength(maximumLength: 1500)]
        public string Note { get; set; }
        public int? Status { get; set; }
        public int? Flag { get; set; }
        [StringLength(maximumLength: 255)]
        public string IllustratorImg { get; set; }
        [StringLength(maximumLength: 255)]
        public string Created_by { get; set; }
        [StringLength(maximumLength: 255)]
        public string Updated_by { get; set; }
    }
}
