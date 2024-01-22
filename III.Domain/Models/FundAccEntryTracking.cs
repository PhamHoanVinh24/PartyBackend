using System;
using System.Collections.Generic;
using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;
using System.Text;

namespace ESEIM.Models
{
    [Table("FUND_ACC_ENTRY_TRACKING")]
    public class FundAccEntryTracking
    {
        [Key, DatabaseGenerated(DatabaseGeneratedOption.Identity)]
        public int Id { get; set; }

        [StringLength(255)]
        public string AetCode { get; set; }

        //[StringLength(255)]
        public string Action { get; set; }

        [StringLength(500)]
        public string Note { get; set; }

        public DateTime? CreatedTime { get; set; }

        [StringLength(50)]
        public string CreatedBy { get; set; }

        [StringLength(255)]
        public string FromDevice { get; set; }

        [StringLength(255)]
        public string LocationText { get; set; }

        [StringLength(255)]
        public string LocationGps { get; set; }

        public bool IsDeleted { get; set; }
    }
}
