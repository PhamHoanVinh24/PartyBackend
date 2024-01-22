using Newtonsoft.Json;
using System;
using System.Collections.Generic;
using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;
using System.Text;

namespace ESEIM.Models
{
    [Table("TEAM")]
    public class Team
    {
        public Team()
        {
            JctCode = new HashSet<JCTrackingBuilding>();
        }
        [DatabaseGenerated(DatabaseGeneratedOption.Identity)]
        public int Id { get; set; }
        [Key, StringLength(255)]
        public string TeamCode { get; set; }

        [StringLength(255)]
        public string TeamName { get; set; }

        [StringLength(4000)]
        public string Members { get; set; }

        [StringLength(255)]
        public string Status { get; set; }

        [StringLength(255)]
        public string Leader { get; set; }

        [StringLength(50)]
        public string CreatedBy { get; set; }

        public DateTime CreatedTime { get; set; }

        [StringLength(50)]
        public string UpdatedBy { get; set; }

        public DateTime? UpdatedTime { get; set; }

        [StringLength(50)]
        public string DeletedBy { get; set; }
        public DateTime? DeletedTime { get; set; }

        public bool IsDeleted { get; set; }

        [StringLength(500)]
        public string Description { get; set; }

        [JsonIgnore]
        public virtual ICollection<JCTrackingBuilding> JctCode { get; set; }
    }
}
