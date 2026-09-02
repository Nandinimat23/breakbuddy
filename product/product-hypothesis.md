# Product hypothesis

## Problem

People who work or study at desks spend long, continuous stretches sitting and looking at a laptop. Most know they should move more, but conventional break reminders — calendar pings, desktop notifications, "stand up and stretch" prompts, Pomodoro timers — are easy to dismiss. They interrupt without giving the user an engaging reason to actually participate.

## User insight

The problem isn't really "people forget to take breaks." It's that **people lack an engaging, low-friction reason to interrupt their work and move.** A reminder that only says "stop and stretch" competes with focused work and almost always loses.

## Hypothesis

**If** short movement breaks are presented as interactive mini-games through a friendly virtual pet, **then** users will be more willing to interrupt their work and complete the movement activity, compared with passive reminders.

The break should feel like *"I'm playing a 30-second game,"* not *"I'm being told to exercise."*

## Target user

Desk-based knowledge workers on a webcam-enabled laptop or desktop: product managers, engineers, designers, analysts, students, writers, remote and office workers.

## Solution

A virtual pet (choice of dog or cat) that appears on a configurable schedule and invites the user into one of four short, camera-based movement games — punching a virtual bag, "drinking" to stretch the neck, kicking a virtual ball, or reaching up to place a poster. Movement is detected locally in the browser via on-device computer vision (MediaPipe hand/pose/face tracking); nothing is uploaded or stored.

## MVP scope

Two pets, four games, fully configurable break schedule, local-only persistence, no login, and a camera-free Demo Mode so the product can be evaluated by anyone (including recruiters) without granting camera access. See `product/PRD.md` for the full spec and `product/roadmap.md` for what's shipped versus planned.

## Validation

This MVP has not yet been user-tested. `product/roadmap.md` leaves explicit space for real usage data (break completion rate, game preference, skip rate, etc. — see PRD section 44) once the product has real users. No metrics are invented here ahead of that data.
