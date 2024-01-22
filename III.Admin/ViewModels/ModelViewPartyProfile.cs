using System;
using System.Collections.Generic;

namespace III.Admin.ViewModels
{
    public class ModelViewPartyProfile
    {
        public LevelEducation LevelEducation { get; set; }
        public string FistName { get; set; }
        public string Sex { get; set; }
        public string LastName { get; set; }
        public string DateOfBirth { get; set; }
        public string HomeTown { get; set; }
        public string PlaceOfBirth { get; set; }
        public string Nation { get; set; }
        public string Religion { get; set; }
        public string NowEmployee { get; set; }
        public string PlaceInGroup { get; set; }
        public string DateInGroup { get; set; }
        public string PlaceInParty { get; set; }
        public string DateInParty { get; set; }
        public string PlaceRecognize { get; set; }
        public string DateRecognize { get; set; }
        public string Presenter { get; set; }
        public string Phone { get; set; }
        public string PhoneLL { get; set; }
    }

    public class LevelEducation
    {
        public Dictionary<string, List<string>> Level { get; set; }
        public string GeneralEducation { get; set; }
        public string VocationalTraining { get; set; }
        public string RankAcademic { get; set; }
    }

    public class PersonalHistory
    {
        public TimeInfo Time { get; set; }
        public string Infor { get; set; }
    }

    public class BusinessNDuty
    {
        public TimeInfo Time { get; set; }
        public string Business { get; set; }
        public string Duty { get; set; }
    }

    public class PassedTrainingClasses
    {
        public string School { get; set; }
        public string Class { get; set; }
        public TimeInfo Time { get; set; }
        public string Business { get; set; }
    }

    public class GoAboard
    {
        public string Purpose { get; set; }
        public string Country { get; set; }
    }

    public class Disciplined
    {
        public string Time { get; set; }
        public string OfficialReason { get; set; }
        public string GrantDecision { get; set; }
    }

    public class SelfComment
    {
        public string Context { get; set; }
    }

    public class Relationship
    {
        public string Relation { get; set; }
        public string ClassComposition { get; set; }
        public bool PartyMember { get; set; }
        public string Name { get; set; }
        public YearInfo Year { get; set; }
        public string HomeTown { get; set; }
        public string Residence { get; set; }
        public string Job { get; set; }
        public List<string> WorkingProcess { get; set; }
        public List<string> PoliticalAttitude { get; set; }
    }

    public class TimeInfo
    {
        public string Begin { get; set; }
        public string End { get; set; }
    }

    public class YearInfo
    {
        public string YearBirth { get; set; }
        public string YearDeath { get; set; }
        public string Reason { get; set; }
    }
}
