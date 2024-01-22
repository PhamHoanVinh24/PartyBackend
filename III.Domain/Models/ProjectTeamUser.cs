using System;
using System.Collections.Generic;
using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;
using System.Text;

namespace ESEIM.Models
{
    [Table("PROJECT_TEAM_USER")]
    public class ProjectTeamUser
    {
        [Key, DatabaseGenerated(DatabaseGeneratedOption.Identity)]
        public int Id { get; set; }
        public string TeamCode { get; set; }
        public string UserId { get; set; }
        public string UserName { get; set; }
        public string Table { get; set; }
        public bool IsDeleted { get; set; }
    }
}
