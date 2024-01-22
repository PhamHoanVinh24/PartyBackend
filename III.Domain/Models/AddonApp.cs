using System;
using System.Collections.Generic;
using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;
using Microsoft.AspNetCore.Http;

namespace ESEIM.Models
{
    [Table("ADDON_APP")]
    public class AddonApp
    {
        [DatabaseGenerated(DatabaseGeneratedOption.Identity)]
        public int Id { get; set; }

        [Key]
        [StringLength(50)]
        public string AppCode { get; set; }

        [StringLength(255)]
        public string AppTitle { get; set; }

        public DateTime? AppDate { get; set; }

        [StringLength(255)]
        public string Icon { get; set; }

        [StringLength(50)]
        public string LinkChplay { get; set; }

        [StringLength(50)]
        public string LinkIOS { get; set; }

        [StringLength(50)]
        public string Status { get; set; }

        public string Note { get; set; }

        [StringLength(50)]
        public string CreatedBy { get; set; }

        public DateTime? CreatedTime { get; set; }

        [StringLength(50)]
        public string UpdatedBy { get; set; }

        public DateTime? UpdatedTime { get; set; }

        public bool IsDeleted { get; set; }
    }
}