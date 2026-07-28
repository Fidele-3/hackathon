# UBUHINZI (E-HINGA)  (**Please read the readme to understand everything because 2 minutes video was only forr citizen side, it doesn't have fully features of this project)

**Digital Agriculture Platform for Rwanda**

> Kigali, Rwanda  
> **Last Updated:** 28 July 2026

---

# Overview

**Ubuhinzi (E-Hinga)** is a digital agriculture platform designed for Rwanda to connect farmers directly with the government officers responsible for agricultural services in their communities while providing a unified management platform for officers from the Cell level up to the National level.

The platform consists of three integrated systems:

| Component | Description |
|-----------|-------------|
| **Backend API** | Central platform containing business logic, data management, authentication, AI services, and all core operations. |
| **Citizen Platform** | Used by farmers and verified produce buyers to access agricultural services and marketplace features. |
| **Administrative Console** | Used by government officers to manage requests, farmers, storage, analytics, and agricultural operations according to their jurisdiction. |

---

# The Problem

The current agricultural support system presents several operational challenges.

| Problem | Description |
|----------|-------------|
| **No Direct Access to Agricultural Experts** | Farmers experiencing crop diseases or livestock illnesses often rely on informal networks instead of a structured support system. |
| **Unstructured Resource Requests** | Requests for fertilizer, seed, medicine, or livestock feed are not automatically delivered to the responsible agricultural officer. |
| **Warehouse Capacity Uncertainty** | Produce storage requests may be approved without verifying available warehouse capacity, resulting in over-allocation. |
| **Unverified Produce Buyers** | Farmers cannot verify whether buyers are legitimate before selling their harvests. |
| **Feature Phone Exclusion** | Existing digital services require smartphones and internet access, excluding many rural farmers. |
| **Limited Government Visibility** | Agricultural officers at different administrative levels lack a unified operational view of activities within their jurisdictions. |

---

# Our Solution

Ubuhinzi introduces an integrated digital ecosystem addressing each of these challenges.

| Capability | Solution |
|------------|----------|
| **AI Agricultural Assistant** | Farmers can report agricultural issues using text, images, or voice messages. The AI responds directly when confident or escalates the conversation to the appropriate agricultural officer while preserving all submitted evidence. |
| **Automatic Request Routing** | Resource requests are automatically assigned to the correct officer based on both geographical jurisdiction and agricultural specialty (Agronomy or Veterinary). |
| **Smart Warehouse Allocation** | Storage requests are validated against real warehouse capacity before approval, preventing overbooking. |
| **Verified Agricultural Marketplace** | Buyers must be verified by the national administration before accessing marketplace listings and only view produce within their assigned administrative areas. |
| **USSD Agricultural Services** | Farmers using feature phones can access AI-powered agricultural support through USSD without requiring internet connectivity. *(Currently in progress)* |
| **Unified Government Dashboard** | Officers across all administrative levels work from one centralized system while only accessing information within their authorized jurisdiction. |

---

# System Architecture

```
                    +-------------------------+
                    |     Backend API         |
                    | Authentication          |
                    | Business Logic          |
                    | AI Services             |
                    | Database                |
                    +-----------+-------------+
                                |
            -------------------------------------------
            |                                         |
            |                                         |
+---------------------------+          +-----------------------------+
| Citizen Platform          |          | Officer Administration      |
| Farmers                   |          | Cell Officers               |
| Buyers                    |          | Sector Officers             |
| AI Assistant              |          | District Officers           |
| Marketplace               |          | National Administration     |
+---------------------------+          +-----------------------------+
```

---

# Role-Based Access Control (RBAC)

Access control is enforced on the server using both **territorial jurisdiction** and **professional specialization**.

## User Roles

| Role | Jurisdiction | Responsibilities |
|------|--------------|------------------|
| **Citizen (Farmer)** | Personal Records | Register land and livestock, request agricultural resources, report harvests, request storage, communicate with AI, and sell produce. |
| **Buyer** | Assigned Cells | Purchase produce only after national verification and only within assigned administrative areas. |
| **Cell Officer** | Single Cell | Manage agricultural requests matching their assigned specialty (Agronomy or Veterinary). |
| **Sector Officer** | One Sector | Manage multiple cells and create Cell Officer accounts. |
| **District Officer** | One District | Manage multiple sectors, create Sector Officer accounts, and access district-level AI insights. |
| **National Administrator** | Nationwide | Full system access, verify buyers, create District Officers, monitor national analytics, and manage the platform. |

---

# Security Model

The platform enforces security through multiple layers.

| Feature | Description |
|----------|-------------|
| **Server-Side Authorization** | Permissions are validated on the backend rather than relying solely on the user interface. |
| **Territorial Isolation** | Officers only access data belonging to their assigned jurisdiction. |
| **Specialization Enforcement** | Agronomists manage crop-related activities while Veterinary officers manage livestock-related activities. |
| **Hierarchical Account Creation** | Officer accounts are created only by the administrative level directly above them. |
| **JWT Authentication** | Two-hour access tokens with fourteen-day refresh tokens provide secure authentication across the platform. |

---

# Core Features

- AI Agricultural Assistant
- AI Image Analysis
- AI Voice Understanding
- AI Text Conversations
- Human Officer Escalation
- Resource Request Management
- Government Warehouse Management
- Smart Storage Allocation
- Produce Marketplace
- Verified Buyer Verification Workflow
- Territory-Based Access Control
- Daily Agricultural Insights
- AI Crop Forecasting
- Officer Management
- Citizen Management
- Livestock Management
- Land Registration
- Harvest Tracking
- Administrative Analytics

---

# Technology Stack

| Layer | Technologies |
|--------|--------------|
| **Backend** | Django, Django REST Framework |
| **Authentication** | JWT |
| **Database** | PostgreSQL |
| **Storage** | Cloud Object Storage |
| **Artificial Intelligence** | Large Language Models, Computer Vision, Speech Processing |
| **Deployment** | Cloud Infrastructure |
| **API** | RESTful API |

---

# Authentication

- JSON Web Token (JWT)
- Secure Refresh Tokens
- Role-Based Authorization
- Jurisdiction-Based Data Filtering
- Server-Side Permission Enforcement

---

# Current Status

## Completed

- Citizen API
- Buyer API
- Administrative Console
- Complete RBAC Implementation
- AI Assistant (Text)
- AI Assistant (Image)
- AI Assistant (Voice)
- Human Escalation Workflow
- Resource Request System
- Government Storage Management
- Warehouse Capacity Validation
- Produce Marketplace
- Buyer Verification Workflow
- Officer AI Assistant
- Daily AI Insights
- District-Level Forecasting
- National-Level Forecasting

---

## In Progress

- USSD Integration
- Interactive Jurisdiction Map
- Feature Phone AI Access

---

# Vision

Ubuhinzi (E-Hinga) aims to become Rwanda's unified digital agriculture platform by connecting farmers, government institutions, artificial intelligence, and agricultural data into one secure ecosystem that improves decision-making, resource allocation, productivity, and food security nationwide.

---

## License

This project is currently under active development.

© 2026 Ubuhinzi (E-Hinga). All rights reserved.
